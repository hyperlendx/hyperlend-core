const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    const poolAddress = await poolAddressesProvider.getPool();

    const AToken = await ethers.getContractFactory("AToken");
    const aToken = await AToken.deploy(poolAddress)
    console.log(`Deployed AToken to ${aToken.address}`)

    await aToken.initialize(
        poolAddress, // initializingPool
        config.ZERO_ADDRESS, // treasury
        config.ZERO_ADDRESS, // underlyingAsset
        config.ZERO_ADDRESS, // incentivesController
        0, // aTokenDecimals
        "HTOKEN_IMPL", // aTokenName
        "HTOKEN_IMPL", // aTokenSymbol
        "0x00" // params
    )

    const DelegationAwareAToken = await ethers.getContractFactory("DelegationAwareAToken");
    const delegationAwareAToken = await DelegationAwareAToken.deploy(poolAddress)
    console.log(`Deployed delegationAwareAToken to ${delegationAwareAToken.address}`)

    await delegationAwareAToken.initialize(
        poolAddress, // initializingPool
        config.ZERO_ADDRESS, // treasury
        config.ZERO_ADDRESS, // underlyingAsset
        config.ZERO_ADDRESS, // incentivesController
        0, // aTokenDecimals
        "DELEGATION_AWARE_HTOKEN_IMPL", // aTokenName
        "DELEGATION_AWARE_HTOKEN_IMPL", // aTokenSymbol
        "0x00" // params
    )

    const StableDebtToken = await ethers.getContractFactory("StableDebtToken");
    const stableDebtToken = await StableDebtToken.deploy(poolAddress)
    console.log(`Deployed stableDebtToken to ${stableDebtToken.address}`)

    await stableDebtToken.initialize(
        poolAddress, // initializingPool
        config.ZERO_ADDRESS, // underlyingAsset
        config.ZERO_ADDRESS, // incentivesController
        0, // debtTokenDecimals
        "STABLE_DEBT_TOKEN_IMPL", // debtTokenName
        "STABLE_DEBT_TOKEN_IMPL", // debtTokenSymbol
        "0x00" // params
    )

    const VariableDebtToken = await ethers.getContractFactory("VariableDebtToken");
    const variableDebtToken = await VariableDebtToken.deploy(poolAddress)
    console.log(`Deployed variableDebtToken to ${variableDebtToken.address}`)

    await variableDebtToken.initialize(
        poolAddress, // initializingPool
        config.ZERO_ADDRESS, // underlyingAsset
        config.ZERO_ADDRESS, // incentivesController
        0, // debtTokenDecimals
        "VARIABLE_DEBT_TOKEN_IMPL", // debtTokenName
        "VARIABLE_DEBT_TOKEN_IMPL", // debtTokenSymbol
        "0x00" // params
    )

    saveDeploymentInfo(path.basename(__filename), {
        aToken: aToken.address,
        delegationAwareAToken: delegationAwareAToken.address,
        variableDebtToken: variableDebtToken.address,
        stableDebtToken: stableDebtToken.address
    })  
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
