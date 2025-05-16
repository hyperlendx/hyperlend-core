const { ethers } = require("hardhat");
require("dotenv").config();
const { permitSignature } = require("../utils/permitSignature");
const { getRoute } = require("../utils/liquidSwapRouteAPI");
const multiHopAbi = require("../artifacts/contracts/interfaces/ILiquidSwapMultiHopRouter.sol/ILiquidSwapMultiHopRouter.json").abi;
const { processRouteData, encodeRouterCall, encodeLiquidswapData } = require("../utils/routeProcessor");

// ABI for the LiquidSwapRepayAdapter contract (only the function we need)
const adapterABI = [
  "function swapAndRepay(address collateralAsset, address debtAsset, uint256 collateralAmount, uint256 debtRepayAmount, uint256 debtRateMode, uint256 buyAllBalanceOffset, bytes calldata liquidswapData, tuple(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) calldata permitSignature) external",
];

// Token ABI for approval
const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];


// Define addresses
const MULTIHOP_ROUTER_ADDRESS = process.env.MULTIHOP_ROUTER_ADDRESS;
const REPAY_ADAPTER_ADDRESS = process.env.LIQUIDSWAP_REPAY_ADAPTER_ADDRESS;
const aTokenAddress = process.env.TESTNET_A_TOKEN_ADDRESS;
const variableDebtTokenAddress = process.env.TESTNET_VARIABLE_DEBT_TOKEN_ADDRESS;

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Please set PRIVATE_KEY in your environment variables");
    process.exit(1);
  }

  // Create a wallet/signer instance from the private key
  const signer = new ethers.Wallet(privateKey, ethers.provider);
  console.log(`Using account: ${signer.address}`);
  console.log(`REPAY_ADAPTER_ADDRESS: ${REPAY_ADAPTER_ADDRESS}`);
  console.log(`MULTIHOP_ROUTER_ADDRESS: ${MULTIHOP_ROUTER_ADDRESS}`);

  // Connect to the adapter contract
  const repayAdapter = new ethers.Contract(
    REPAY_ADAPTER_ADDRESS,
    adapterABI,
    signer
  );

  // Define token addresses
  const collateralAsset = process.env.COLLATERAL_ASSET; // wHYPE
  const debtAsset = process.env.DEBT_ASSET; // wstHYPE

  const variableDebtToken = new ethers.Contract(
    variableDebtTokenAddress,
    erc20ABI,
    signer
  );

  const debtBalance = await variableDebtToken.balanceOf(signer.address);
  const debtRepayAmount = ethers.formatUnits(debtBalance, 18);

  const debtRateMode = 2; // Variable rate mode (2)
  const buyAllBalanceOffset = 0; // Set to 0 to repay a specific amount, or non-zero to repay entire debt

  // For repay operations, we need to get a route that will buy enough debtAsset using our collateral
  console.log("Getting route for buying", debtRepayAmount, "of", debtAsset, "using", collateralAsset);
  const routeData = await getRoute(collateralAsset, debtAsset, debtRepayAmount, true, true);

  if (!routeData || !routeData.data || !routeData.data.bestPath) {
    throw new Error("Invalid route data returned from API");
  }

  try {
    const { tokens, hopSwaps, tokenInfo } = processRouteData(routeData, collateralAsset, debtAsset);

    const estimatedCollateralAmountToSpend = ethers.parseUnits(
      tokenInfo.amountIn,
      tokenInfo.tokenIn.decimals
    );

    // Add 2% buffer for slippage
    const maxCollateralToSpendWithSlippage = (estimatedCollateralAmountToSpend * 102n) / 100n;

    const parsedDebtRepayAmount = ethers.parseUnits(
      debtRepayAmount,
      tokenInfo.tokenOut.decimals
    );

    // Encode the router call and liquidswap data using our utility functions
    const buyCalldata = encodeRouterCall(
      tokens,
      maxCollateralToSpendWithSlippage,
      parsedDebtRepayAmount,
      hopSwaps,
      multiHopAbi
    );

    // Encode the liquidswap data
    const liquidswapData = encodeLiquidswapData(buyCalldata, MULTIHOP_ROUTER_ADDRESS);

    const permitSig = await permitSignature(
      signer,
      aTokenAddress,
      maxAmountCollateralToSpend,
      REPAY_ADAPTER_ADDRESS,
    );

    // Execute the swapAndRepay
    console.log("Executing swapAndRepay...");
    console.log("Parameters:");
    console.log("- Collateral asset:", collateralAsset);
    console.log("- Debt asset:", debtAsset);
    console.log("- Max Collateral amount to spend with added slippage:", maxCollateralToSpendWithSlippage.toString());
    console.log("- Debt repay amount:", parsedDebtRepayAmount.toString());
    console.log("- Debt rate mode:", debtRateMode);
    console.log("- Buy all balance offset:", buyAllBalanceOffset);
    console.log("- Permit signature:", permitSig);


    const tx = await repayAdapter.swapAndRepay(
      collateralAsset,
      debtAsset,
      maxCollateralToSpendWithSlippage,
      parsedDebtRepayAmount,
      debtRateMode,
      buyAllBalanceOffset,
      liquidswapData,
      permitSig,
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
