const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo } = require("../../markets")

async function main() {
    const PoolAddressesProviderRegistry = await ethers.getContractFactory("PoolAddressesProviderRegistry");
    const poolAddressesProviderRegistry = await PoolAddressesProviderRegistry.deploy(config.poolAddressesProviderRegistry_owner);
    console.log(`PoolAddressesProviderRegistry deployed to ${poolAddressesProviderRegistry.address}`);

    saveDeploymentInfo(path.basename(__filename), {
        poolAddressesProviderRegistry: poolAddressesProviderRegistry.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
