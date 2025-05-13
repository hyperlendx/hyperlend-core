// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.10;

import {SafeERC20} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeERC20.sol';
import {SafeMath} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeMath.sol';
import {IERC20Detailed} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol';
import {IPoolAddressesProvider} from 'hyperlend-core/src/contracts/interfaces/IPoolAddressesProvider.sol';
import {ILiquidSwapMultiHopRouter} from '../interfaces/ILiquidSwapMultiHopRouter.sol';
import {BaseLiquidSwapBuyAdapter} from '../BaseLiquidSwapBuyAdapter.sol';
import {ReentrancyGuard} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/ReentrancyGuard.sol';

/**
 * @title TestLiquidSwapBuyAdapter
 * @notice Test contract that implements BaseLiquidSwapBuyAdapter and exposes the _buyOnLiquidSwap function
 */
contract TestLiquidSwapBuyAdapter is BaseLiquidSwapBuyAdapter, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20Detailed;

  constructor(
    IPoolAddressesProvider addressesProvider,
    ILiquidSwapMultiHopRouter multiHopRouterAddress,
    address owner
  ) BaseLiquidSwapBuyAdapter(addressesProvider, multiHopRouterAddress) {
    transferOwnership(owner);
  }

  /**
   * @notice Public function that calls the internal _buyOnLiquidSwap function
   * @dev This function will emit the Bought event through the internal function call
   * @param liquidswapData Encoded data containing HopSwapData[][] and tokens[] for the MultiHopRouter
   * @param assetToSwapFrom Address of the asset to be swapped from
   * @param assetToSwapTo Address of the asset to be swapped to
   * @param maxAmountToSwap Max amount to be swapped
   * @param amountToReceive Minimum amount to be received from the swap
   * @return amountSold The amount sold during the swap
   * @return amountBought The amount bought during the swap
   */
  function buyOnLiquidSwap(
    bytes memory liquidswapData,
    IERC20Detailed assetToSwapFrom,
    IERC20Detailed assetToSwapTo,
    uint256 maxAmountToSwap,
    uint256 amountToReceive
  ) external payable nonReentrant returns (uint256 amountSold, uint256 amountBought) {

    assetToSwapFrom.safeTransferFrom(msg.sender, address(this), maxAmountToSwap);

    (amountSold, amountBought) = _buyOnLiquidSwap(
      liquidswapData,
      assetToSwapFrom,
      assetToSwapTo,
      maxAmountToSwap,
      amountToReceive
    );

    // Transfer the bought assets back to the caller
    assetToSwapTo.safeTransfer(msg.sender, amountBought);

    return (amountSold, amountBought);
  }

  /**
   * @dev Required override for FlashLoanSimpleReceiverBase
   * @notice This function is not used in this test contract
   */
  function executeOperation(
    address,
    uint256,
    uint256,
    address,
    bytes calldata
  ) external override nonReentrant returns (bool) {
    revert('NOT_SUPPORTED');
  }
}
