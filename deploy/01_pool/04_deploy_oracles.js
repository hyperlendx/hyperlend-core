const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    const HyperlendOracle = await ethers.getContractFactory("HyperlendOracle");
    const hyperlendOracle = await HyperlendOracle.deploy(
        poolAddressesProvider.address,
        config.oracle.assets,
        config.oracle.sources,
        config.oracle.fallbackOracleAddress,
        config.ZERO_ADDRESS,
        config.oracle.baseCurrencyUnit
    )
    console.log(`priceOracle deployed to ${hyperlendOracle.address}`)

    const configPriceOracle = hyperlendOracle.address;
    const statePriceOracle = await poolAddressesProvider.getPriceOracle();
    if (configPriceOracle == statePriceOracle) {
        console.log("[addresses-provider] Price oracle already set. Skipping tx.");
    } else {
        await poolAddressesProvider.setPriceOracle(configPriceOracle)
        console.log(`[Deployment] Added PriceOracle ${configPriceOracle} to PoolAddressesProvider`);
    }
    
    saveDeploymentInfo(path.basename(__filename), {
        hyperlendOracle: hyperlendOracle.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
