// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.10;

import {DataTypes} from 'hyperlend-core/src/contracts/protocol/libraries/types/DataTypes.sol';
import {IERC20Detailed} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol';
import {IERC20} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/IERC20.sol';
import {IPoolAddressesProvider} from 'hyperlend-core/src/contracts/interfaces/IPoolAddressesProvider.sol';
import {SafeERC20} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeERC20.sol';
import {SafeMath} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeMath.sol';
import {BaseSwapBuyAdapter} from './BaseSwapBuyAdapter.sol';
import {ReentrancyGuard} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/ReentrancyGuard.sol';

/**
 * @title SwapRepayAdapter
 * @notice LiquidSwapRepayAdapter over any allowlisted router: repays a debt with collateral.
 **/
contract SwapRepayAdapter is BaseSwapBuyAdapter, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  constructor(
    IPoolAddressesProvider addressesProvider,
    address[] memory routers,
    address owner
  ) BaseSwapBuyAdapter(addressesProvider, routers) {
    transferOwnership(owner);
  }

  /**
   * @dev Flash-loan path: repays the initiator's debt with the flash-borrowed collateral, then pulls the
   * initiator's aTokens to cover the flash loan.
   * params: abi.encode(debtAsset, debtRepayAmount, buyAllBalanceOffset, rateMode, swapData, permitSignature)
   */
  function executeOperation(
    address asset,
    uint256 amount,
    uint256 premium,
    address initiator,
    bytes calldata params
  ) external override nonReentrant returns (bool) {
    require(msg.sender == address(POOL), 'CALLER_MUST_BE_POOL');

    uint256 collateralAmount = amount;
    address initiatorLocal = initiator;

    IERC20Detailed collateralAsset = IERC20Detailed(asset);

    _swapAndRepay(params, premium, initiatorLocal, collateralAsset, collateralAmount);

    return true;
  }

  /**
   * @dev Pulls the caller's aTokens, swaps them to the debt asset and repays the caller's debt.
   * @param collateralAmount Max amount of collateral to swap; the unsold rest is supplied back for the caller
   * @param debtRepayAmount Amount to repay, or the cap when repaying the whole debt
   * @param buyAllBalanceOffset Non-zero to repay the whole debt
   * @param swapData abi.encode(bytes routerCalldata, address router)
   */
  function swapAndRepay(
    IERC20Detailed collateralAsset,
    IERC20Detailed debtAsset,
    uint256 collateralAmount,
    uint256 debtRepayAmount,
    uint256 debtRateMode,
    uint256 buyAllBalanceOffset,
    bytes calldata swapData,
    PermitSignature calldata permitSignature
  ) external nonReentrant {
    debtRepayAmount = getDebtRepayAmount(
      debtAsset,
      debtRateMode,
      buyAllBalanceOffset,
      debtRepayAmount,
      msg.sender
    );

    _pullATokenAndWithdraw(address(collateralAsset), msg.sender, collateralAmount, permitSignature);

    (uint256 amountSold, uint256 amountBought) = _buyOnRouter(
      swapData,
      collateralAsset,
      debtAsset,
      collateralAmount,
      debtRepayAmount
    );

    uint256 collateralBalanceLeft = collateralAmount - amountSold;

    if (collateralBalanceLeft > 0) {
      IERC20(collateralAsset).safeApprove(address(POOL), collateralBalanceLeft);
      POOL.deposit(address(collateralAsset), collateralBalanceLeft, msg.sender, 0);
      IERC20(collateralAsset).safeApprove(address(POOL), 0);
    }

    IERC20(debtAsset).safeApprove(address(POOL), debtRepayAmount);
    POOL.repay(address(debtAsset), debtRepayAmount, debtRateMode, msg.sender);
    IERC20(debtAsset).safeApprove(address(POOL), 0);

    {
      uint256 debtAssetExcess = amountBought - debtRepayAmount;
      if (debtAssetExcess > 0) {
        IERC20(debtAsset).safeTransfer(msg.sender, debtAssetExcess);
      }
    }
  }

  function _swapAndRepay(
    bytes calldata params,
    uint256 premium,
    address initiator,
    IERC20Detailed collateralAsset,
    uint256 collateralAmount
  ) private {
    (
      IERC20Detailed debtAsset,
      uint256 debtRepayAmount,
      uint256 buyAllBalanceOffset,
      uint256 rateMode,
      bytes memory swapData,
      PermitSignature memory permitSignature
    ) = abi.decode(params, (IERC20Detailed, uint256, uint256, uint256, bytes, PermitSignature));

    debtRepayAmount = getDebtRepayAmount(
      debtAsset,
      rateMode,
      buyAllBalanceOffset,
      debtRepayAmount,
      initiator
    );

    (uint256 amountSold, uint256 amountBought) = _buyOnRouter(
      swapData,
      collateralAsset,
      debtAsset,
      collateralAmount,
      debtRepayAmount
    );

    IERC20(debtAsset).safeApprove(address(POOL), debtRepayAmount);
    POOL.repay(address(debtAsset), debtRepayAmount, rateMode, initiator);
    IERC20(debtAsset).safeApprove(address(POOL), 0);

    uint256 neededForFlashLoanRepay = amountSold.add(premium);

    _pullATokenAndWithdraw(
      address(collateralAsset),
      initiator,
      neededForFlashLoanRepay,
      permitSignature
    );

    {
      uint256 debtAssetExcess = amountBought - debtRepayAmount;
      if (debtAssetExcess > 0) {
        IERC20(debtAsset).safeTransfer(initiator, debtAssetExcess);
      }
    }

    IERC20(collateralAsset).safeApprove(address(POOL), 0);
    IERC20(collateralAsset).safeApprove(address(POOL), collateralAmount.add(premium));
  }

  function getDebtRepayAmount(
    IERC20Detailed debtAsset,
    uint256 rateMode,
    uint256 buyAllBalanceOffset,
    uint256 debtRepayAmount,
    address initiator
  ) private view returns (uint256) {
    require(
      DataTypes.InterestRateMode(rateMode) == DataTypes.InterestRateMode.VARIABLE,
      'INVALID_RATE_MODE'
    );

    address variableDebtTokenAddress = POOL.getReserveData(address(debtAsset)).variableDebtTokenAddress;

    uint256 currentDebt = IERC20(variableDebtTokenAddress).balanceOf(initiator);

    if (buyAllBalanceOffset != 0) {
      require(currentDebt <= debtRepayAmount, 'INSUFFICIENT_AMOUNT_TO_REPAY');
      debtRepayAmount = currentDebt;
    } else {
      require(debtRepayAmount <= currentDebt, 'INVALID_DEBT_REPAY_AMOUNT');
    }

    return debtRepayAmount;
  }
}
