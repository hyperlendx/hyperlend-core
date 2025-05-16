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
 * @title BaseLiquidSwapSellAdapter.sol
 * @notice Implements the logic for selling tokens on LiquidSwap
 * @author Jason Raymond Bell
 */
abstract contract BaseLiquidSwapSellAdapter is BaseLiquidSwapAdapter {
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
   * @dev Swaps a token for another using LiquidSwap
   * @param liquidswapData Encoded data containing sellCalldata and multiHopRouter address for the MultiHopRouter
   * @param assetToSwapFrom Address of the asset to be swapped from
   * @param assetToSwapTo Address of the asset to be swapped to
   * @param amountToSwap Amount to be swapped
   * @param minAmountToReceive Minimum amount to be received from the swap
   * @return amountReceived The amount received from the swap
   */
  function _sellOnLiquidSwap(
    bytes memory liquidswapData,
    IERC20Detailed assetToSwapFrom,
    IERC20Detailed assetToSwapTo,
    uint256 amountToSwap,
    uint256 minAmountToReceive
  ) internal returns (uint256 amountReceived) {
    (bytes memory sellCalldata, address multiHopRouter) = abi.decode(liquidswapData, (bytes, address));

    require(multiHopRouter == address(MULTIHOP_ROUTER), 'INVALID_MULTIHOP_ROUTER');

    uint256 balanceBeforeAssetFrom = assetToSwapFrom.balanceOf(address(this));
    require(balanceBeforeAssetFrom >= amountToSwap, 'INSUFFICIENT_BALANCE_BEFORE_SWAP');
    uint256 balanceBeforeAssetTo = assetToSwapTo.balanceOf(address(this));

    // Approve the router to spend our tokens
    assetToSwapFrom.safeApprove(multiHopRouter, amountToSwap);

    // Execute the multi-hop swap
    (bool success, ) = multiHopRouter.call(sellCalldata);
    if (!success) {
      // Copy revert reason from call
      assembly {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }

    // Reset allowance
    assetToSwapFrom.safeApprove(multiHopRouter, 0);

    require(
      assetToSwapFrom.balanceOf(address(this)) == balanceBeforeAssetFrom - amountToSwap,
      'WRONG_BALANCE_AFTER_SWAP'
    );
    amountReceived = assetToSwapTo.balanceOf(address(this)).sub(balanceBeforeAssetTo);
    require(amountReceived >= minAmountToReceive, 'INSUFFICIENT_AMOUNT_RECEIVED');

    emit Swapped(address(assetToSwapFrom), address(assetToSwapTo), amountToSwap, amountReceived);
  }
}
