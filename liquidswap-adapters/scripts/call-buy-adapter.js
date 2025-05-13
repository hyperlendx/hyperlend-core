const { ethers } = require("hardhat");
const axios = require("axios");
require("dotenv").config();

const multiHopAbi = require("../artifacts/contracts/interfaces/ILiquidSwapMultiHopRouter.sol/ILiquidSwapMultiHopRouter.json").abi;
// ABI for the TestLiquidSwapBuyAdapter contract (only the function we need)
const adapterABI = [
  "function buyOnLiquidSwap(bytes memory liquidswapData, address assetToSwapFrom, address assetToSwapTo, uint256 maxAmountToSwap, uint256 amountToReceive) external returns (uint256 amountSold, uint256 amountBought)",
];

const MULTIHOP_ROUTER_ADDRESS = process.env.MULTIHOP_ROUTER_ADDRESS;
const BASE_LIQUIDSWAP_BUY_ADAPTER_ADDRESS =
  process.env.BASE_LIQUIDSWAP_BUY_ADAPTER_ADDRESS;

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
      `https://api.liqd.ag/route?tokenA=${tokenA}&tokenB=${tokenB}&amountOut=${amountIn}&multiHop=true`
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
  console.log(`BASE_LIQUIDSWAP_BUY_ADAPTER_ADDRESS: ${BASE_LIQUIDSWAP_BUY_ADAPTER_ADDRESS}`);
  console.log(`MULTIHOP_ROUTER_ADDRESS: ${MULTIHOP_ROUTER_ADDRESS}`);

  // Connect to the adapter contract
  const buyAdapter = new ethers.Contract(
    BASE_LIQUIDSWAP_BUY_ADAPTER_ADDRESS,
    adapterABI,
    signer
  );
  // Define token addresses (replace with actual addresses)
  const fromTokenAddress = "0x1ecd15865d7f8019d546f76d095d9c93cc34edfa"; //LIQD (asset to spend)
  const toTokenAddress = "0x47bb061c0204af921f43dc73c7d7768d2672ddee"; // PURR (asset to buy)
  const targetAmountToBuy = "10"; // Amount of PURR we want to buyw

  // For buy operations, we need to estimate how much of the fromToken we need to spend
  // to get our target amount of toToken. For simplicity, we'll use the API with the target amount
  // and then adjust our parameters accordingly.
  console.log("Getting route for buying", targetAmountToBuy, "of", toTokenAddress, "by spending", fromTokenAddress);
  const routeData = await getRoute(fromTokenAddress, toTokenAddress, targetAmountToBuy);

  // Debug: Log the API response
  console.log("API Response received");
  if (routeData && routeData.data) {
    console.log("bestPath exists:", !!routeData.data.bestPath);
    console.log("tokenInfo exists:", !!routeData.data.tokenInfo);
  } else {
    console.log("Invalid or empty response from API");
    console.log("routeData:", routeData);
  }

  if (!routeData || !routeData.data || !routeData.data.bestPath) {
    throw new Error("Invalid route data returned from API");
  }

  try {
    // Extract path information
    const bestPath = routeData.data.bestPath;
    const tokenInfo = routeData.data.tokenInfo || {};

    // Debug: Log the structure of bestPath
    console.log("bestPath structure:", JSON.stringify(bestPath, null, 2));
    console.log("tokenInfo structure:", JSON.stringify(tokenInfo, null, 2));

    // Ensure tokenInfo has the required properties
    if (!tokenInfo.tokenIn || !tokenInfo.tokenOut) {
      console.log("Warning: tokenInfo is missing required properties");
      // Set default values if missing
      tokenInfo.tokenIn = tokenInfo.tokenIn || { decimals: 18, address: fromTokenAddress };
      tokenInfo.tokenOut = tokenInfo.tokenOut || { decimals: 18, address: toTokenAddress };
    }

    // Log the token decimals for debugging
    console.log("Token decimals - In:", tokenInfo.tokenIn.decimals, "Out:", tokenInfo.tokenOut.decimals);

    // Format data for contract call
    let tokens = [];
    let hopSwaps = [];

    // Process the path
    if (bestPath.hop && bestPath.hop.length > 0) {
      console.log("Processing hop path with", bestPath.hop.length, "hops");
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

          console.log(`Hop ${i} - Using decimals:`, tokenInDecimals);

          // Process each allocation in this hop
          if (hopData.allocations && hopData.allocations.length > 0) {
            for (const allocation of hopData.allocations) {
              // Ensure all required properties exist
              if (!allocation.tokenIn || !allocation.tokenOut || !allocation.amountIn) {
                console.log("Warning: Allocation missing required properties", allocation);
                continue;
              }

              try {
                const amountInParsed = ethers.parseUnits(
                  allocation.amountIn.toString(),
                  tokenInDecimals
                ).toString();

                swapsForHop.push({
                  tokenIn: allocation.tokenIn,
                  tokenOut: allocation.tokenOut,
                  routerIndex: parseInt(allocation.routerIndex) || 0,
                  fee: parseInt(allocation.fee) || 0,
                  amountIn: amountInParsed,
                  stable: allocation.stable || false,
                });
              } catch (error) {
                console.error("Error processing allocation:", error.message);
                console.log("Problematic allocation:", allocation);
              }
            }
          } else {
            console.log("Warning: No allocations found for hop", i);
          }

          hopSwaps.push(swapsForHop);
        }
      } catch (error) {
        console.error("Error processing hop path:", error.message);
        // Create a simple direct path as fallback
        tokens = [fromTokenAddress, toTokenAddress];
        hopSwaps = [[
          {
            tokenIn: fromTokenAddress,
            tokenOut: toTokenAddress,
            routerIndex: 0,
            fee: 0,
            amountIn: ethers.parseUnits(targetAmountToBuy, 18).toString(),
            stable: false,
          }
        ]];
      }
    } else {
      console.log("No hop path found, creating simple direct path");
      // Create a simple direct path
      tokens = [fromTokenAddress, toTokenAddress];
      hopSwaps = [[
        {
          tokenIn: fromTokenAddress,
          tokenOut: toTokenAddress,
          routerIndex: 0,
          fee: 0,
          amountIn: ethers.parseUnits(targetAmountToBuy, 18).toString(),
          stable: false,
        }
      ]];
    }

    // For a buy operation:
    // 1. The amount we want to receive is our target amount
    // 2. We need to calculate the maximum amount we're willing to spend (with some buffer)

    console.log("Calculating buy parameters...");

    // Parse the target amount we want to buy
    let amountToReceive;
    try {
      amountToReceive = ethers.parseUnits(
        targetAmountToBuy,
        tokenInfo.tokenOut.decimals
      );
      console.log("Target amount to receive:", amountToReceive.toString());
    } catch (error) {
      console.error("Error parsing target amount:", error.message);
      // Default to a small amount with 18 decimals
      amountToReceive = ethers.parseUnits("0.01", 18);
      console.log("Using default target amount:", amountToReceive.toString());
    }

    // In a buy operation, we need to estimate how much of the source token we need to spend
    // The API gives us the expected output for a given input, but we need to reverse this
    // For simplicity, we'll use the targetAmountToBuy as our input and add a buffer

    // We'll use the original amountIn from our API request as a starting point
    let estimatedInput;
    try {
      estimatedInput = ethers.parseUnits(
        targetAmountToBuy,  // We're using the same amount as input for simplicity
        tokenInfo.tokenIn.decimals
      );
      console.log("Estimated input amount:", estimatedInput.toString());
    } catch (error) {
      console.error("Error parsing estimated input:", error.message);
      // Default to a small amount with 18 decimals
      estimatedInput = ethers.parseUnits("0.01", 18);
      console.log("Using default estimated input:", estimatedInput.toString());
    }

    // Add a 20% buffer to the estimated input as our max amount to spend
    // This is a conservative buffer since we're estimating
    const maxAmountToSpend = (estimatedInput * 120n) / 100n;
    console.log("Max amount to spend (with buffer):", maxAmountToSpend.toString());



    const routerIface = new ethers.Interface(multiHopAbi);
    // For the router call, we use our estimated input with a buffer
    // The adapter will handle ensuring we get at least our target amount
    const buyCalldata = routerIface.encodeFunctionData(
      "executeMultiHopSwap",
      [tokens, maxAmountToSpend, amountToReceive, hopSwaps]
    );

    const liquidswapData = ethers.AbiCoder.defaultAbiCoder().encode(
      ["bytes", "address"],
      [buyCalldata, MULTIHOP_ROUTER_ADDRESS]
    );

    // Approve first - we need to approve our max amount to spend
    const tokenContract = new ethers.Contract(
      tokenInfo.tokenIn.address,
      erc20ABI,
      signer
    );
    console.log("approving...");
    console.log("maxAmountToSpend: ", maxAmountToSpend.toString());
    const approveTx = await tokenContract.approve(
      BASE_LIQUIDSWAP_BUY_ADAPTER_ADDRESS,
      maxAmountToSpend
    );
    await approveTx.wait();
    console.log("approved!");
    // Execute the swap with ERC-20 token
    console.log("Execute the swap with ERC-20 token");

    console.log("Buy parameters:");
    console.log("- From token (asset to spend):", fromTokenAddress);
    console.log("- To token (asset to buy):", toTokenAddress);
    console.log("- Max amount to spend:", maxAmountToSpend.toString());
    console.log("- Target amount to buy:", amountToReceive.toString());

    const tx = await buyAdapter.buyOnLiquidSwap(
      liquidswapData,
      fromTokenAddress,
      toTokenAddress,
      maxAmountToSpend,
      amountToReceive,
      {
        gasLimit: 2000000,
      }
    );
    console.log("Transaction submitted...");
    const receipt = await tx.wait();
    console.log("Transaction successful!");

    // Try to extract the swap details from the transaction logs
    try {
      // Look for the Bought event in the logs
      const boughtEvent = receipt.logs.find(log => {
        try {
          const decoded = buyAdapter.interface.parseLog(log);
          return decoded.name === 'Bought';
        } catch (e) {
          return false;
        }
      });

      if (boughtEvent) {
        const decoded = buyAdapter.interface.parseLog(boughtEvent);
        console.log("Buy details:");
        console.log("- From asset:", decoded.args.fromAsset);
        console.log("- To asset:", decoded.args.toAsset);
        console.log("- Amount spent:", decoded.args.amountSold.toString());
        console.log("- Amount bought:", decoded.args.amountBought.toString());
      }
    } catch (error) {
      console.log("Could not parse buy event details:", error.message);
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
