// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.10;

import {SafeERC20} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeERC20.sol';
import {SafeMath} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/SafeMath.sol';
import {IPoolAddressesProvider} from 'hyperlend-core/src/contracts/interfaces/IPoolAddressesProvider.sol';
import {IERC20Detailed} from 'hyperlend-core/src/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol';
import {BaseLiquidSwapAdapter} from './BaseLiquidSwapAdapter.sol';

/**
 * @title BaseSwapBuyAdapter
 * @notice BaseLiquidSwapBuyAdapter with the single immutable router replaced by an owner-managed allowlist
 */
abstract contract BaseSwapBuyAdapter is BaseLiquidSwapAdapter {
  using SafeMath for uint256;
  using SafeERC20 for IERC20Detailed;

  mapping(address => bool) public allowedRouters;

  event RouterSet(address indexed router, bool allowed);

  constructor(
    IPoolAddressesProvider addressesProvider,
    address[] memory routers
  ) BaseLiquidSwapAdapter(addressesProvider) {
    for (uint256 i = 0; i < routers.length; i++) {
      _setRouter(routers[i], true);
    }
  }

  function setRouter(address router, bool allowed) external onlyOwner {
    _setRouter(router, allowed);
  }

  function _setRouter(address router, bool allowed) private {
    allowedRouters[router] = allowed;
    emit RouterSet(router, allowed);
  }

  /**
   * @param swapData abi.encode(bytes routerCalldata, address router)
   * @param maxAmountToSwap Max amount of assetToSwapFrom the router may take
   * @param amountToReceive Minimum amount of assetToSwapTo this contract must receive
   */
  function _buyOnRouter(
    bytes memory swapData,
    IERC20Detailed assetToSwapFrom,
    IERC20Detailed assetToSwapTo,
    uint256 maxAmountToSwap,
    uint256 amountToReceive
  ) internal returns (uint256 amountSold, uint256 amountBought) {
    (bytes memory routerCalldata, address router) = abi.decode(swapData, (bytes, address));

    require(allowedRouters[router], 'ROUTER_NOT_ALLOWED');

    uint256 balanceBeforeAssetFrom = assetToSwapFrom.balanceOf(address(this));
    require(balanceBeforeAssetFrom >= maxAmountToSwap, 'INSUFFICIENT_BALANCE_BEFORE_SWAP');
    uint256 balanceBeforeAssetTo = assetToSwapTo.balanceOf(address(this));

    assetToSwapFrom.safeApprove(router, maxAmountToSwap);

    (bool success, ) = router.call(routerCalldata);
    if (!success) {
      assembly {
        returndatacopy(0, 0, returndatasize())
        revert(0, returndatasize())
      }
    }

    assetToSwapFrom.safeApprove(router, 0);

    uint256 balanceAfterAssetFrom = assetToSwapFrom.balanceOf(address(this));
    amountSold = balanceBeforeAssetFrom - balanceAfterAssetFrom;
    require(amountSold <= maxAmountToSwap, 'WRONG_BALANCE_AFTER_SWAP');
    amountBought = assetToSwapTo.balanceOf(address(this)).sub(balanceBeforeAssetTo);
    require(amountBought >= amountToReceive, 'INSUFFICIENT_AMOUNT_RECEIVED');

    emit Bought(address(assetToSwapFrom), address(assetToSwapTo), amountSold, amountBought);
  }
}
