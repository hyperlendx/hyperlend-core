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

    // 4. Deploy HyperlendProtocolDataProvider getters contract
    const ProtocolDataProvider = await ethers.getContractFactory("HyperlendProtocolDataProvider");
    const protocolDataProvider = await ProtocolDataProvider.deploy(poolAddressesProvider.address);
    console.log(`protocolDataProvider deployed to ${protocolDataProvider.address}`);

    // Set the ProtocolDataProvider if is not already set at addresses provider
    const currentProtocolDataProvider = await poolAddressesProvider.getPoolDataProvider();
    if (protocolDataProvider.address != currentProtocolDataProvider) {
        await poolAddressesProvider.setPoolDataProvider(protocolDataProvider.address)
    }

    saveDeploymentInfo(path.basename(__filename), {
        poolAddressesProvider: poolAddressesProvider.address,
        protocolDataProvider: protocolDataProvider.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
