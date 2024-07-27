const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path'); 

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    // 1. Deploy PoolAddressesProvider
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = await PoolAddressesProvider.deploy(0, config.poolAddressesProvider_owner);
    console.log(`poolAddressesProvider deployed to ${poolAddressesProvider.address}`);

    // 2. Set the MarketId
    await poolAddressesProvider.setMarketId(config.poolConfig.marketId)
    console.log(`poolAddressesProvider.setMarketId set`)

    // 3. Add AddressesProvider to Registry
    const PoolAddressesProviderRegistry = await ethers.getContractFactory("PoolAddressesProviderRegistry");
    const poolAddressesProviderRegistry = PoolAddressesProviderRegistry.attach(getDeployedContractAddress("poolAddressesProviderRegistry"));
    await poolAddressesProviderRegistry.registerAddressesProvider(poolAddressesProvider.address, config.poolConfig.providerId)

    // 4. Deploy AaveProtocolDataProvider getters contract
    const AaveProtocolDataProvider = await ethers.getContractFactory("AaveProtocolDataProvider");
    const aaveProtocolDataProvider = await AaveProtocolDataProvider.deploy(poolAddressesProvider.address);
    console.log(`aaveProtocolDataProvider deployed to ${aaveProtocolDataProvider.address}`);

    // Set the ProtocolDataProvider if is not already set at addresses provider
    const currentProtocolDataProvider = await poolAddressesProvider.getPoolDataProvider();
    if (aaveProtocolDataProvider.address != currentProtocolDataProvider) {
        await poolAddressesProvider.setPoolDataProvider(aaveProtocolDataProvider.address)
    }

    saveDeploymentInfo(path.basename(__filename), {
        poolAddressesProvider: poolAddressesProvider.address,
        aaveProtocolDataProvider: aaveProtocolDataProvider.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
