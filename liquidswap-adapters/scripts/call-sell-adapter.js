const { ethers } = require("hardhat");
const axios = require("axios");
require("dotenv").config();

const multiHopAbi = require("../artifacts/contracts/interfaces/ILiquidSwapMultiHopRouter.sol/ILiquidSwapMultiHopRouter.json").abi;
// ABI for the TestLiquidSwapSellAdapter contract (only the function we need)
const adapterABI = [
  "function sellOnLiquidSwap(bytes memory liquidswapData, address assetToSwapFrom, address assetToSwapTo, uint256 amountToSwap, uint256 minAmountToReceive) external payable returns (uint256 amountReceived)",
];

const MULTIHOP_ROUTER_ADDRESS = process.env.MULTIHOP_ROUTER_ADDRESS;
const BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS =
  process.env.BASE_LIQUIDSWAP_SELL_ADAPTER_ADDRESS;

// Token ABI for approval
const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

// Function to get route from API
async function getRoute(tokenA, tokenB, amountIn) {
  try {
    const response = await axios.get(
      `https://api.liqd.ag/route?tokenA=${tokenA}&tokenB=${tokenB}&amountIn=${amountIn}&multiHop=true`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching route:", error.message);
    throw error;
  }
}

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

  // Debug: Log the API response
  console.log("API Response received");
  if (routeData && routeData.data) {
    console.log("bestPath exists:", !!routeData.data.bestPath);
    console.log("tokenInfo exists:", !!routeData.data.tokenInfo);
  }

  if (!routeData || !routeData.data || !routeData.data.bestPath) {
    throw new Error("Invalid route data returned from API");
  }

  try {
    // Extract path information
    const bestPath = routeData.data.bestPath;
    const tokenInfo = routeData.data.tokenInfo;

    // Format data for contract call
    let tokens = [];
    let hopSwaps = [];

    // Process the path
    if (bestPath.hop.length > 0) {
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
        const tokenInDecimals =
          i === 0
            ? tokenInfo.tokenIn.decimals
            : tokenInfo.intermediate.decimals;

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
    }

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

    const routerIface = new ethers.Interface(multiHopAbi);
    const sellCalldata = routerIface.encodeFunctionData(
      "executeMultiHopSwap",
      [tokens, exactAmountToSell, minAmountToReceive, hopSwaps]
    );

    const liquidswapData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes", "address"],
      [sellCalldata, MULTIHOP_ROUTER_ADDRESS]
    );

    // Approve first
    const tokenContract = new ethers.Contract(
      tokenInfo.tokenIn.address,
      erc20ABI,
      signer
    );
    console.log("approving...");
    console.log("exactAmountToSell: ", exactAmountToSell.toString());
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

    // Try to extract the amountReceived from the transaction logs
    try {
      // Look for the Swapped event in the logs
      const swappedEvent = receipt.logs.find(log => {
        try {
          const decoded = sellAdapter.interface.parseLog(log);
          return decoded.name === 'Swapped';
        } catch (e) {
          return false;
        }
      });

      if (swappedEvent) {
        const decoded = sellAdapter.interface.parseLog(swappedEvent);
        console.log("Sell details:");
        console.log("- From asset:", decoded.args.fromAsset);
        console.log("- To asset:", decoded.args.toAsset);
        console.log("- Amount sold:", decoded.args.amountSold.toString());
        console.log("- Amount received:", decoded.args.receivedAmount.toString());
      }
    } catch (error) {
      console.log("Could not parse sell event details:", error.message);
    }

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
