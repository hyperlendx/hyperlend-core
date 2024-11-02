const { ethers } = require("hardhat");
const path = require('path');

async function main({ config, saveDeploymentInfo, getDeployedContractAddress, verify }) {
    const poolAddressesProviderAddress = getDeployedContractAddress("poolAddressesProvider")
    if (poolAddressesProviderAddress.length == 0) throw new Error(`missing poolAddressesProvider address`)
    
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(poolAddressesProviderAddress);

    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy(
        poolAddressesProvider.target,
        config.oracle.assets,
        config.oracle.sources,
        config.oracle.fallbackOracleAddress,
        config.ZERO_ADDRESS,
        config.oracle.baseCurrencyUnit
    )
    console.log(`priceOracle deployed to ${oracle.target}`)
    await verify(oracle.target, [
        poolAddressesProvider.target,
        config.oracle.assets,
        config.oracle.sources,
        config.oracle.fallbackOracleAddress,
        config.ZERO_ADDRESS,
        config.oracle.baseCurrencyUnit
    ])

    const configPriceOracle = oracle.target;
    const statePriceOracle = await poolAddressesProvider.getPriceOracle();
    if (configPriceOracle == statePriceOracle) {
        console.log("price oracle already set. Skipping tx.");
    } else {
        await poolAddressesProvider.setPriceOracle(configPriceOracle)
        console.log(`added PriceOracle ${configPriceOracle} to PoolAddressesProvider`);
    }
    
    saveDeploymentInfo(path.basename(__filename), {
        oracle: oracle.target
    })
}

module.exports = main
