const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();
const { permitSignature } = require("../utils/permitSignature");
const { getRoute } = require("../utils/liquidSwapRouteAPI");
const {
  processRouteData,
  encodeRouterCall,
  encodeLiquidswapData,
} = require("../utils/routeProcessor");
const { repayAdapterABI, erc20ABI, multiHopAbi } = require("../scripts/abis/index");

describe("LiquidSwapRepayAdapter", function () {
  const MULTIHOP_ROUTER_ADDRESS = process.env.MULTIHOP_ROUTER_ADDRESS;
  const REPAY_ADAPTER_ADDRESS =
    process.env.LIQUIDSWAP_REPAY_ADAPTER_ADDRESS;
  const aTokenAddress = process.env.TESTNET_A_TOKEN_ADDRESS;
  const variableDebtTokenAddress =
    process.env.TESTNET_VARIABLE_DEBT_TOKEN_ADDRESS;
  const collateralAsset = process.env.COLLATERAL_ASSET; // wHYPE
  const debtAsset = process.env.DEBT_ASSET; // wstHYPE

  let signer, repayAdapter, aToken, variableDebtToken;
  let debtRateMode,
    buyAllBalanceOffset,
    parsedDebtRepayAmount,
    maxCollateralToSpendWithSlippage,
    liquidswapData;

  before(async function () {
    // Get signers
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error("Please set PRIVATE_KEY in your environment variables");
      process.exit(1);
    }

    signer = new ethers.Wallet(privateKey, ethers.provider);
    console.log(`Using account: ${signer.address}`);

    // Connect to the deployed contracts
    try {
      repayAdapter = new ethers.Contract(
        REPAY_ADAPTER_ADDRESS,
        repayAdapterABI,
        signer
      );

      // Verify the contract was initialized correctly
      console.log("RepayAdapter initialized at:", REPAY_ADAPTER_ADDRESS);

      // Optional: Check if the contract has the expected methods
      if (!repayAdapter.swapAndRepay) {
        console.error("Contract missing expected methods");
      }
    } catch (error) {
      console.error("Error initializing repayAdapter contract:", error);
      throw error;
    }

    aToken = new ethers.Contract(aTokenAddress, erc20ABI, signer);

    variableDebtToken = new ethers.Contract(
      variableDebtTokenAddress,
      erc20ABI,
      signer
    );

    const debtBalance = await variableDebtToken.balanceOf(signer.address);
    const debtRepayAmount = ethers.formatUnits(debtBalance, 18);

    debtRateMode = 2; // Variable rate mode (2)
    buyAllBalanceOffset = 0; // Set to 0 to repay a specific amount, or non-zero to repay entire debt
  });

  it("should successfully repay partial debt (50%)", async function () {
    this.timeout(300000);
    let receipt;

    // Get current debt balance
    const debtBalance = await variableDebtToken.balanceOf(signer.address);
    console.log("debtBalance", debtBalance);
    // Calculate 50% of the debt
    const partialDebtAmount = debtBalance / 2n;
    const debtRepayAmount = ethers.formatUnits(partialDebtAmount, 18);
    console.log(`Repaying 50% of debt: ${debtRepayAmount}`);

    // For repay operations, we need to get a route that will buy enough debtAsset using our collateral
    console.log(
      "Getting route for buying",
      debtRepayAmount,
      "of",
      debtAsset,
      "using",
      collateralAsset
    );

    const routeData = await getRoute(
      collateralAsset,
      debtAsset,
      debtRepayAmount,
      true,
      true
    );
    if (!routeData || !routeData.data || !routeData.data.bestPath) {
      throw new Error("Invalid route data returned from API");
    }

    // Process the route data
    const { tokens, hopSwaps, tokenInfo } = processRouteData(
      routeData,
      collateralAsset,
      debtAsset
    );

    const estimatedCollateralAmountToSpend = ethers.parseUnits(
      tokenInfo.amountIn,
      tokenInfo.tokenIn.decimals
    );

    // Add 2% buffer for slippage
    maxCollateralToSpendWithSlippage =
      (estimatedCollateralAmountToSpend * 102n) / 100n;

    parsedDebtRepayAmount = ethers.parseUnits(
      debtRepayAmount,
      tokenInfo.tokenOut.decimals
    );

    // Encode the router call and liquidswap data
    const buyCalldata = encodeRouterCall(
      tokens,
      maxCollateralToSpendWithSlippage,
      parsedDebtRepayAmount,
      hopSwaps,
      multiHopAbi
    );

    // Encode the liquidswap data
    liquidswapData = encodeLiquidswapData(buyCalldata, MULTIHOP_ROUTER_ADDRESS);

    // Create permit signature for the partial amount
    const permitSig = await permitSignature(
      signer,
      aTokenAddress,
      maxCollateralToSpendWithSlippage,
      REPAY_ADAPTER_ADDRESS
    );

    console.log("Executing swapAndRepay for partial debt...");
    console.log("Parameters:");
    console.log("- Collateral asset:", collateralAsset);
    console.log("- Debt asset:", debtAsset);
    console.log(
      "- Max Collateral amount to spend:",
      maxCollateralToSpendWithSlippage.toString()
    );
    console.log("- Partial debt repay amount:", partialDebtAmount.toString());
    console.log("- Debt rate mode: 2 (Variable)");
    console.log("- Buy all balance offset: 0");

    try {
      // Execute the swapAndRepay function with partial amount
      const tx = await repayAdapter.swapAndRepay(
        collateralAsset,
        debtAsset,
        maxCollateralToSpendWithSlippage,
        partialDebtAmount,
        debtRateMode,
        buyAllBalanceOffset,
        liquidswapData,
        permitSig,
        {
          gasLimit: 2000000,
          maxFeePerGas: ethers.parseUnits("8", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"),
        }
      );

      console.log("Transaction submitted:", tx.hash);
      receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      // Check if debt was partially repaid
      const debtBalanceAfter = await variableDebtToken.balanceOf(
        signer.address
      );
      console.log(
        `Debt balance after partial repayment: ${ethers.formatUnits(
          debtBalanceAfter,
          18
        )}`
      );

      // Calculate expected remaining debt (approximately 90% of original)
      const expectedRemainingDebt = debtBalance - partialDebtAmount;

      // The test passes if the transaction was successful
      expect(receipt.status).to.equal(1);

      // Expect debt to be partially repaid (with some tolerance for accrued interest)
      expect(debtBalanceAfter).to.be.closeTo(
        expectedRemainingDebt,
        expectedRemainingDebt / 100n
      ); // 1% tolerance
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
  });

  it("should successfully repay entire debt", async function () {
    this.timeout(300000);
    let receipt;

    // Get the current debt balance after the partial repayment
    const currentDebtBalance = await variableDebtToken.balanceOf(
      signer.address
    );
    const remainingDebtRepayAmount = ethers.formatUnits(currentDebtBalance, 18);

    console.log(`Remaining debt to repay: ${remainingDebtRepayAmount}`);

    // Recalculate route for the remaining debt
    const routeData = await getRoute(
      collateralAsset,
      debtAsset,
      remainingDebtRepayAmount,
      true,
      true
    );

    if (!routeData || !routeData.data || !routeData.data.bestPath) {
      throw new Error("Invalid route data returned from API");
    }

    // Process the route data for remaining debt
    const { tokens, hopSwaps, tokenInfo } = processRouteData(
      routeData,
      collateralAsset,
      debtAsset
    );

    const estimatedCollateralAmountToSpend = ethers.parseUnits(
      tokenInfo.amountIn,
      tokenInfo.tokenIn.decimals
    );

    // Add 2% buffer for slippage
    const updatedMaxCollateralToSpend =
      (estimatedCollateralAmountToSpend * 120n) / 100n;

    const updatedParsedDebtRepayAmount = ethers.parseUnits(
      remainingDebtRepayAmount,
      tokenInfo.tokenOut.decimals
    );

    // Encode the router call and liquidswap data for remaining debt
    const buyCalldata = encodeRouterCall(
      tokens,
      updatedMaxCollateralToSpend,
      updatedParsedDebtRepayAmount,
      hopSwaps,
      multiHopAbi
    );

    // Encode the liquidswap data
    const updatedLiquidswapData = encodeLiquidswapData(
      buyCalldata,
      MULTIHOP_ROUTER_ADDRESS
    );

    // Create permit signature for the updated amount
    const permitSig = await permitSignature(
      signer,
      aTokenAddress,
      updatedMaxCollateralToSpend,
      REPAY_ADAPTER_ADDRESS
    );

    console.log("Executing swapAndRepay for remaining debt...");
    console.log("Parameters:");
    console.log("- Collateral asset:", collateralAsset);
    console.log("- Debt asset:", debtAsset);
    console.log(
      "- Max Collateral amount to spend:",
      updatedMaxCollateralToSpend.toString()
    );
    console.log(
      "- Debt repay amount:",
      updatedParsedDebtRepayAmount.toString()
    );
    console.log("- Debt rate mode: 2 (Variable)");
    console.log("- Buy all balance offset: 1"); // Using 1 to repay all remaining debt

    try {
      // Execute the swapAndRepay function
      const tx = await repayAdapter.swapAndRepay(
        collateralAsset,
        debtAsset,
        updatedMaxCollateralToSpend,
        updatedMaxCollateralToSpend, // We set debtRepayAmount to the same value as collateralAmount to repay all remaining debt
        debtRateMode,
        1, // Set to 1 to repay all remaining debt
        updatedLiquidswapData,
        permitSig,
        {
          gasLimit: 2000000,
          maxFeePerGas: ethers.parseUnits("8", "gwei"),
          maxPriorityFeePerGas: ethers.parseUnits("5", "gwei"),
        }
      );

      console.log("Transaction submitted:", tx.hash);
      receipt = await tx.wait();
      console.log("Transaction confirmed in block:", receipt.blockNumber);

      // Check if debt was repaid
      const debtBalanceAfter = await variableDebtToken.balanceOf(
        signer.address
      );
      console.log(
        `Debt balance after repayment: ${ethers.formatUnits(
          debtBalanceAfter,
          18
        )}`
      );

      // The test passes if the transaction was successful
      expect(receipt.status).to.equal(1);

      // Expect debt to be closed to 0
      expect(debtBalanceAfter).to.be.closeTo(0n, 1n);
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
  });
});
