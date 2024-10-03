const { ethers } = require("hardhat");
const path = require('path'); 

const { config, saveDeploymentInfo, getDeployedContractAddress, verify } = require("../../markets")

async function main() {
    // 1. Deploy PoolAddressesProvider
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = await PoolAddressesProvider.deploy(config.poolConfig.marketId, config.poolAddressesProvider_owner);
    console.log(`poolAddressesProvider deployed to ${poolAddressesProvider.address}`);
    await verify(poolAddressesProvider.address, [config.poolConfig.marketId, config.poolAddressesProvider_owner])

    // 2. Set the MarketId
    await poolAddressesProvider.setMarketId(config.poolConfig.marketId)
    console.log(`poolAddressesProvider.setMarketId set to ${config.poolConfig.marketId}`)

    // 3. Add AddressesProvider to Registry
    const poolAddressesProviderRegistryAddress = getDeployedContractAddress("poolAddressesProviderRegistry")
    if (poolAddressesProviderRegistryAddress.length == 0) throw new Error("missing poolAddressesProviderRegistryAddress")

    const PoolAddressesProviderRegistry = await ethers.getContractFactory("PoolAddressesProviderRegistry");
    const poolAddressesProviderRegistry = PoolAddressesProviderRegistry.attach(poolAddressesProviderRegistryAddress);
    await poolAddressesProviderRegistry.registerAddressesProvider(poolAddressesProvider.address, config.poolConfig.providerId)

    // 4. Deploy ProtocolDataProvider getters contract
    const ProtocolDataProvider = await ethers.getContractFactory("ProtocolDataProvider");
    const protocolDataProvider = await ProtocolDataProvider.deploy(poolAddressesProvider.address);
    console.log(`protocolDataProvider deployed to ${protocolDataProvider.address}`);
    await verify(protocolDataProvider.address, [poolAddressesProvider.address])

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
