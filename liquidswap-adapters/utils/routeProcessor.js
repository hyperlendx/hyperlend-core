/**
 * Route Processor Utility
 *
 * This utility processes route data from the LiquidSwap API and formats it for contract calls.
 * It handles building the tokens array and hopSwaps structure required by the MultiHopRouter.
 */
const { ethers } = require("hardhat");

/**
 * Process route data from the API and format it for contract calls
 *
 * @param {Object} routeData - The route data returned from the API
 * @param {string} fromToken - The address of the token to swap from
 * @param {string} toToken - The address of the token to swap to
 * @returns {Object} An object containing the tokens array and hopSwaps array
 */
function processRouteData(routeData, fromToken, toToken) {
  if (!routeData || !routeData.data || !routeData.data.bestPath) {
    throw new Error("Invalid route data returned from API");
  }

  // Extract path information
  const bestPath = routeData.data.bestPath;
  const tokenInfo = routeData.data.tokenInfo || {};

  // Ensure tokenInfo has the required properties
  if (!tokenInfo.tokenIn || !tokenInfo.tokenOut) {
    console.log("Warning: tokenInfo is missing required properties");
    // Set default values if missing
    tokenInfo.tokenIn = tokenInfo.tokenIn || { decimals: 18, address: fromToken };
    tokenInfo.tokenOut = tokenInfo.tokenOut || { decimals: 18, address: toToken };
  }

  // Format data for contract call
  let tokens = [];
  let hopSwaps = [];

  // Process the path
  if (bestPath.hop && bestPath.hop.length > 0) {
    try {
      // Build the token path array
      tokens = [bestPath.hop[0].tokenIn];
      for (let i = 0; i < bestPath.hop.length; i++) {
        tokens.push(bestPath.hop[i].tokenOut);
      }

      // Process each hop
      for (let i = 0; i < bestPath.hop.length; i++) {
        const hopData = bestPath.hop[i];
        const swapsForHop = [];

        // Get the appropriate decimals for this hop's input token
        // Default to 18 if not available
        const tokenInDecimals = i === 0
          ? (tokenInfo.tokenIn ? tokenInfo.tokenIn.decimals : 18)
          : (tokenInfo.intermediate ? tokenInfo.intermediate.decimals : 18);

        // Process each allocation in this hop
        for (const allocation of hopData.allocations) {
          swapsForHop.push({
            tokenIn: allocation.tokenIn,
            tokenOut: allocation.tokenOut,
            routerIndex: parseInt(allocation.routerIndex) || 0,
            fee: parseInt(allocation.fee) || 0,
            amountIn: ethers
              .parseUnits(allocation.amountIn, tokenInDecimals)
              .toString(),
            stable: allocation.stable || false,
          });
        }

        hopSwaps.push(swapsForHop);
      }
    } catch (error) {
      console.error("Error processing hop path:", error.message);
    }
  } else {
    console.log("No hop path found, creating simple direct path");
  }

  return {
    tokens,
    hopSwaps,
    tokenInfo
  };
}

/**
 * Encode the router call data for the MultiHopRouter
 *
 * @param {Array} tokens - Array of token addresses in the path
 * @param {bigInt} amountIn - Amount of input token
 * @param {bigInt} minAmountOut - Minimum amount of output token to receive
 * @param {Array} hopSwaps - Array of hop swap data
 * @param {Array} multiHopAbi - ABI of the MultiHopRouter
 * @returns {string} Encoded function data
 */
function encodeRouterCall(tokens, amountIn, minAmountOut, hopSwaps, multiHopAbi) {
  const routerIface = new ethers.Interface(multiHopAbi);
  return routerIface.encodeFunctionData(
    "executeMultiHopSwap",
    [tokens, amountIn, minAmountOut, hopSwaps]
  );
}

/**
 * Encode the liquidswap data for adapter calls
 *
 * @param {string} buyCalldata - Encoded router call data
 * @param {string} routerAddress - Address of the MultiHopRouter
 * @returns {string} Encoded liquidswap data
 */
function encodeLiquidswapData(buyCalldata, routerAddress) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes", "address"],
    [buyCalldata, routerAddress]
  );
}

module.exports = {
  processRouteData,
  encodeRouterCall,
  encodeLiquidswapData
};
