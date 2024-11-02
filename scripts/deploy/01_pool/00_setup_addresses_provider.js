const { ethers } = require("hardhat");
const path = require('path'); 

async function main({ config, saveDeploymentInfo, getDeployedContractAddress, verify }) {
    // 1. Deploy PoolAddressesProvider
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = await PoolAddressesProvider.deploy(config.poolConfig.marketId, config.poolAddressesProvider_owner);
    console.log(`poolAddressesProvider deployed to ${poolAddressesProvider.target}`);
    await verify(poolAddressesProvider.target, [config.poolConfig.marketId, config.poolAddressesProvider_owner])

    // 2. Set the MarketId
    await poolAddressesProvider.setMarketId(config.poolConfig.marketId)
    console.log(`poolAddressesProvider.setMarketId set to ${config.poolConfig.marketId}`)

    // 3. Add AddressesProvider to Registry
    const poolAddressesProviderRegistryAddress = getDeployedContractAddress("poolAddressesProviderRegistry")
    if (poolAddressesProviderRegistryAddress.length == 0) throw new Error("missing poolAddressesProviderRegistryAddress")

    const PoolAddressesProviderRegistry = await ethers.getContractFactory("PoolAddressesProviderRegistry");
    const poolAddressesProviderRegistry = PoolAddressesProviderRegistry.attach(poolAddressesProviderRegistryAddress);
    await poolAddressesProviderRegistry.registerAddressesProvider(poolAddressesProvider.target, config.poolConfig.providerId)

    // 4. Deploy ProtocolDataProvider getters contract
    const ProtocolDataProvider = await ethers.getContractFactory("ProtocolDataProvider");
    const protocolDataProvider = await ProtocolDataProvider.deploy(poolAddressesProvider.target);
    console.log(`protocolDataProvider deployed to ${protocolDataProvider.target}`);
    await verify(protocolDataProvider.target, [poolAddressesProvider.target])

    // Set the ProtocolDataProvider if is not already set at addresses provider
    const currentProtocolDataProvider = await poolAddressesProvider.getPoolDataProvider();
    if (protocolDataProvider.target != currentProtocolDataProvider) {
        await poolAddressesProvider.setPoolDataProvider(protocolDataProvider.target)
    }

    saveDeploymentInfo(path.basename(__filename), {
        poolAddressesProvider: poolAddressesProvider.target,
        protocolDataProvider: protocolDataProvider.target
    })
}

module.exports = main