const { ethers } = require("hardhat");
require("dotenv").config();
const {multiHopAbi, adapterABI, erc20ABI} = require("./abis");
const { processRouteData, encodeRouterCall, encodeLiquidswapData } = require("../utils/routeProcessor");
const { getRoute } = require("../utils/liquidSwapRouteAPI");

const MULTIHOP_ROUTER_ADDRESS = process.env.MULTIHOP_ROUTER_ADDRESS;
const BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS =
  process.env.BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS;

async function main() {
  // Connect to the network
  const [signer] = await ethers.getSigners();
  console.log(`Using account: ${signer.address}`);
  console.log(`BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS: ${BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS}`);
  console.log(`MULTIHOP_ROUTER_ADDRESS: ${MULTIHOP_ROUTER_ADDRESS}`);

  // Connect to the adapter contract
  const sellAdapter = new ethers.Contract(
    BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS,
    adapterABI,
    signer
  );
  // Define token addresses (replace with actual addresses)
  const fromTokenAddress = "0x1ecd15865d7f8019d546f76d095d9c93cc34edfa"; // LIQD (asset to sell)
  const toTokenAddress = "0x5555555555555555555555555555555555555555"; // HYPE (asset to receive)
  const amountToSell = "10"; // Amount of LIQD we want to sell

  // For sell operations, we specify exactly how much of the source token we want to sell
  console.log("Getting route for selling", amountToSell, "of", fromTokenAddress, "to receive", toTokenAddress);
  const routeData = await getRoute(fromTokenAddress, toTokenAddress, amountToSell);

  if (!routeData || !routeData.data || !routeData.data.bestPath) {
    throw new Error("Invalid route data returned from API");
  }

  try {
    // Process the route data using our utility
    const { tokens, hopSwaps, tokenInfo } = processRouteData(routeData, fromTokenAddress, toTokenAddress);

    // For a sell operation:
    // 1. The amount we want to sell is fixed (amountToSell)
    // 2. We calculate the minimum amount we're willing to accept with slippage tolerance

    // Parse the exact amount we want to sell
    const exactAmountToSell = ethers.parseUnits(
      amountToSell,
      tokenInfo.tokenIn.decimals
    );

    // Calculate the expected output based on the route
    // If bestPath.amountOut is not available, we'll use a conservative estimate
    let expectedOut;
    if (bestPath.amountOut) {
      expectedOut = ethers.parseUnits(
        bestPath.amountOut,
        tokenInfo.tokenOut.decimals
      );
    } else {
      // If amountOut is not available, we'll use a conservative estimate
      // based on the hop data if available
      console.log("bestPath.amountOut not found, using alternative calculation");

      // For simplicity, we'll use a placeholder value and rely on the slippage tolerance
      // In a real scenario, you might want to calculate this based on exchange rates
      expectedOut = ethers.parseUnits(
        amountToSell,  // Using the same amount as a placeholder
        tokenInfo.tokenOut.decimals
      );
    }

    // Apply 1% slippage tolerance to get our minimum acceptable amount
    const minAmountToReceive = (expectedOut * 99n) / 100n;

    // Encode the router call and liquidswap data using our utility functions
    const sellCalldata = encodeRouterCall(
      tokens,
      exactAmountToSell,
      minAmountToReceive,
      hopSwaps,
      multiHopAbi
    );

    // Encode the liquidswap data
    const liquidswapData = encodeLiquidswapData(sellCalldata, MULTIHOP_ROUTER_ADDRESS);

    // Approve first
    const tokenContract = new ethers.Contract(
      tokenInfo.tokenIn.address,
      erc20ABI,
      signer
    );
    console.log("approving...");
    const approveTx = await tokenContract.approve(
      BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS,
      exactAmountToSell
    );
    await approveTx.wait();
    console.log("approved!");
    // Execute the swap with ERC-20 token
    console.log("Execute the swap with ERC-20 token");

    console.log("Sell parameters:");
    console.log("- From token (asset to sell):", fromTokenAddress);
    console.log("- To token (asset to receive):", toTokenAddress);
    console.log("- Exact amount to sell:", exactAmountToSell.toString());
    console.log("- Minimum amount to receive:", minAmountToReceive.toString());

    const tx = await sellAdapter.sellOnLiquidSwap(
      liquidswapData,
      fromTokenAddress,
      toTokenAddress,
      exactAmountToSell,
      minAmountToReceive,
      {
        gasLimit: 2000000,
      }
    );
    console.log("Transaction submitted...");
    const receipt = await tx.wait();
    console.log("Transaction successful!");

    return receipt;
  } catch (error) {
    console.error("Transaction reverted");

    if (error.reason) {
      console.error("Revert reason:", error.reason);
    }

    if (error.error && error.error.message) {
      console.error("Nested error message:", error.error.message);
    }

    console.error("Full error object:", error);

    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
