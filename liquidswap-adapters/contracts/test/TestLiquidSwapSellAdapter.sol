// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.10;

import {SafeERC20} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeERC20.sol';
import {SafeMath} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeMath.sol';
import {IERC20Detailed} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol';
import {IPoolAddressesProvider} from 'hyperlend-core/src/contracts/interfaces/IPoolAddressesProvider.sol';
import {ILiquidSwapMultiHopRouter} from '../interfaces/ILiquidSwapMultiHopRouter.sol';
import {BaseLiquidSwapSellAdapter} from '../BaseLiquidSwapSellAdapter.sol';
import {ReentrancyGuard} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/ReentrancyGuard.sol';

/**
 * @title TestLiquidSwapBuyAdapter
 * @notice Test contract that implements BaseLiquidSwapSellAdapter and exposes the _sellOnLiquidSwap function
 */
contract TestLiquidSwapSellAdapter is BaseLiquidSwapSellAdapter, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20Detailed;

  constructor(
    IPoolAddressesProvider addressesProvider,
    ILiquidSwapMultiHopRouter multiHopRouterAddress,
    address owner
  ) BaseLiquidSwapSellAdapter(addressesProvider, multiHopRouterAddress) {
    transferOwnership(owner);
  }

  /**
   * @notice Public function that calls the internal _sellOnLiquidSwap function
   * @dev This function will emit the Swapped event through the internal function call
   * @param liquidswapData Encoded data containing buyCalldata and multiHopRouter address for the MultiHopRouter
   * @param assetToSwapFrom Address of the asset to be swapped from
   * @param assetToSwapTo Address of the asset to be swapped to
   * @param amountToSwap Amount to be swapped
   * @param minAmountToReceive Minimum amount to be received from the swap
   * @return amountReceived The amount received from the swap
   */
  function sellOnLiquidSwap(
    bytes memory liquidswapData,
    IERC20Detailed assetToSwapFrom,
    IERC20Detailed assetToSwapTo,
    uint256 amountToSwap,
    uint256 minAmountToReceive
  ) external payable nonReentrant returns (uint256 amountReceived) {

    assetToSwapFrom.safeTransferFrom(msg.sender, address(this), amountToSwap);

    amountReceived = _sellOnLiquidSwap(
      liquidswapData,
      assetToSwapFrom,
      assetToSwapTo,
      amountToSwap,
      minAmountToReceive
    );

    // Transfer the received assets back to the caller
    assetToSwapTo.safeTransfer(msg.sender, amountReceived);

    return amountReceived;
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
