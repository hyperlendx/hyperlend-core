const { ethers } = require("hardhat");
const path = require('path');

async function main({ config, saveDeploymentInfo, verify }) {
    const PoolAddressesProviderRegistry = await ethers.getContractFactory("PoolAddressesProviderRegistry");
    const poolAddressesProviderRegistry = await PoolAddressesProviderRegistry.deploy(config.poolAddressesProviderRegistry_owner);
    console.log(`PoolAddressesProviderRegistry deployed to ${poolAddressesProviderRegistry.target}`);

    saveDeploymentInfo(path.basename(__filename), {
        poolAddressesProviderRegistry: poolAddressesProviderRegistry.target
    })

    await verify(poolAddressesProviderRegistry.target, [config.poolAddressesProviderRegistry_owner])
}

module.exports = main