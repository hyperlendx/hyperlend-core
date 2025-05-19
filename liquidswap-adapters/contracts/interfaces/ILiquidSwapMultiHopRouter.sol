// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ILiquidSwapMultiHopRouter {
    struct HopSwapData {
        address tokenIn;
        address tokenOut;
        uint8 routerIndex;
        uint24 fee;
        uint256 amountIn;
        bool stable;
    }

    function executeMultiHopSwap(
        address[] calldata tokens,
        uint256 amountIn,
        uint256 minAmountOut,
        HopSwapData[][] calldata hopSwaps
    ) external payable returns (uint256 totalAmountOut);
}
