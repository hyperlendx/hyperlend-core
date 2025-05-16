/**
 * LiquidSwap Route API Utility
 *
 * This utility provides functions to interact with the LiquidSwap API for route data.
 */
const axios = require("axios");

/**
 * Get route data from the LiquidSwap API
 *
 * @param {string} tokenA - The address of the source token
 * @param {string} tokenB - The address of the target token
 * @param {string} amount - The amount to swap
 * @param {boolean} isBuyOrder - If true, this is a buy order (amount is the target amount to receive)
 *                              If false, this is a sell order (amount is the source amount to sell)
 * @param {boolean} multiHop - Whether to use multi-hop routing
 * @returns {Promise<Object>} The route data from the API
 */
async function getRoute(tokenA, tokenB, amount, isBuyOrder, multiHop = true) {
  try {
    // For buy orders, we use amountOut (we want to receive a specific amount of the target token)
    // For sell orders, we use amountIn (we want to sell a specific amount of the source token)
    const amountParam = isBuyOrder ? "amountOut" : "amountIn";

    const response = await axios.get(
      `https://api.liqd.ag/route?tokenA=${tokenA}&tokenB=${tokenB}&${amountParam}=${amount}&multiHop=${multiHop}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching route:", error.message);
    throw error;
  }
}

module.exports = {
  getRoute
};