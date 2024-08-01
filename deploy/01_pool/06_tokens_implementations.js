const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    const poolAddress = await poolAddressesProvider.getPool();

    const HToken = await ethers.getContractFactory("HToken");
    const hToken = await HToken.deploy(poolAddress)
    console.log(`Deployed HToken to ${hToken.address}`)

    await hToken.initialize(
        poolAddress, // initializingPool
        config.ZERO_ADDRESS, // treasury
        config.ZERO_ADDRESS, // underlyingAsset
        config.ZERO_ADDRESS, // incentivesController
        0, // hTokenDecimals
        "ATOKEN_IMPL", // hTokenName
        "ATOKEN_IMPL", // hTokenSymbol
        "0x00" // params
    )

    const DelegationAwareHToken = await ethers.getContractFactory("DelegationAwareHToken");
    const delegationAwareHToken = await DelegationAwareHToken.deploy(poolAddress)
    console.log(`Deployed delegationAwareHToken to ${delegationAwareHToken.address}`)

    await delegationAwareHToken.initialize(
        poolAddress, // initializingPool
        config.ZERO_ADDRESS, // treasury
        config.ZERO_ADDRESS, // underlyingAsset
        config.ZERO_ADDRESS, // incentivesController
        0, // hTokenDecimals
        "DELEGATION_AWARE_ATOKEN_IMPL", // hTokenName
        "DELEGATION_AWARE_ATOKEN_IMPL", // hTokenSymbol
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
        hToken: hToken.address,
        delegationAwareHToken: delegationAwareHToken.address,
        variableDebtToken: variableDebtToken.address,
        stableDebtToken: stableDebtToken.address
    })  
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
