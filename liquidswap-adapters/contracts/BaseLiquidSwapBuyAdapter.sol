// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.10;

import {SafeERC20} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeERC20.sol';
import {SafeMath} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeMath.sol';
import {PercentageMath} from 'hyperlend-core/src/contracts/protocol/libraries/math/PercentageMath.sol';
import {IPoolAddressesProvider} from 'hyperlend-core/src/contracts/interfaces/IPoolAddressesProvider.sol';
import {IERC20Detailed} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol';
import {ILiquidSwapMultiHopRouter} from './interfaces/ILiquidSwapMultiHopRouter.sol';
import {BaseLiquidSwapAdapter} from './BaseLiquidSwapAdapter.sol';

/**
 * @title BaseLiquidSwapBuyAdapter.sol
 * @notice Implements the logic for buying tokens on ParaSwap
 */
abstract contract BaseLiquidSwapBuyAdapter is BaseLiquidSwapAdapter {
  using PercentageMath for uint256;
  using SafeMath for uint256;
  using SafeERC20 for IERC20Detailed;

  ILiquidSwapMultiHopRouter public immutable MULTIHOP_ROUTER;

  constructor(
    IPoolAddressesProvider addressesProvider,
    ILiquidSwapMultiHopRouter multiHopRouterAddress
  ) BaseLiquidSwapAdapter(addressesProvider) {
    MULTIHOP_ROUTER = multiHopRouterAddress;
  }

  /**
   * @dev Swaps a token for another using LiquidSwap's MultiHopRouter
   * @param liquidswapData Encoded data containing buyCalldata and multiHopRouter address for the MultiHopRouter
   * @param assetToSwapFrom Address of the asset to be swapped from
   * @param assetToSwapTo Address of the asset to be swapped to
   * @param maxAmountToSwap Max amount to be swapped
   * @param amountToReceive Minimum amount to be received from the swap
   * @return amountSold The amount sold during the swap
   * @return amountBought The amount bought during the swap
   */
  function _buyOnLiquidSwap(
    bytes memory liquidswapData,
    IERC20Detailed assetToSwapFrom,
    IERC20Detailed assetToSwapTo,
    uint256 maxAmountToSwap,
    uint256 amountToReceive
  ) internal returns (uint256 amountSold, uint256 amountBought) {
    (bytes memory buyCalldata, address multiHopRouter) = abi.decode(liquidswapData, (bytes, address));

    require(multiHopRouter == address(MULTIHOP_ROUTER), 'INVALID_MULTIHOP_ROUTER');

    uint256 balanceBeforeAssetFrom = assetToSwapFrom.balanceOf(address(this));
    require(balanceBeforeAssetFrom >= maxAmountToSwap, 'INSUFFICIENT_BALANCE_BEFORE_SWAP');
    uint256 balanceBeforeAssetTo = assetToSwapTo.balanceOf(address(this));

    // Approve the router to spend our tokens
    assetToSwapFrom.safeApprove(multiHopRouter, maxAmountToSwap);

    // Execute the multi-hop swap
    (bool success, ) = multiHopRouter.call(buyCalldata);
    if (!success) {
      // Copy revert reason from call
      assembly {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }

    // Reset allowance
    assetToSwapFrom.safeApprove(multiHopRouter, 0);

    uint256 balanceAfterAssetFrom = assetToSwapFrom.balanceOf(address(this));
    amountSold = balanceBeforeAssetFrom - balanceAfterAssetFrom;
    require(amountSold <= maxAmountToSwap, 'WRONG_BALANCE_AFTER_SWAP');
    amountBought = assetToSwapTo.balanceOf(address(this)).sub(balanceBeforeAssetTo);
    require(amountBought >= amountToReceive, 'INSUFFICIENT_AMOUNT_RECEIVED');

    emit Bought(address(assetToSwapFrom), address(assetToSwapTo), amountSold, amountBought);
  }
}
