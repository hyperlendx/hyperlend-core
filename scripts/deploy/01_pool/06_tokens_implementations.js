const { ethers } = require("hardhat");
const path = require('path');

async function main({ config, saveDeploymentInfo, getDeployedContractAddress, verify }) {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    const poolAddress = await poolAddressesProvider.getPool();

    const AToken = await ethers.getContractFactory("AToken");
    const aToken = await AToken.deploy(poolAddress)
    console.log(`HToken deployed to ${aToken.target}`)
    await verify(aToken.target, [poolAddress])

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
    console.log(`delegationAwareAToken deployed to ${delegationAwareAToken.target}`)
    await verify(delegationAwareAToken.target, [poolAddress])

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
    console.log(`stableDebtToken deployed to ${stableDebtToken.target}`)
    await verify(stableDebtToken.target, [poolAddress])

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
    console.log(`variableDebtToken deployed to ${variableDebtToken.target}`)
    await verify(variableDebtToken.target, [poolAddress])

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
        aToken: aToken.target,
        delegationAwareAToken: delegationAwareAToken.target,
        variableDebtToken: variableDebtToken.target,
        stableDebtToken: stableDebtToken.target
    })  
}

module.exports = main