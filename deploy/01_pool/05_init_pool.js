const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    const Pool = await ethers.getContractFactory("Pool");
    const pool = Pool.attach(getDeployedContractAddress("pool"));

    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    const Proxy = await ethers.getContractFactory("InitializableImmutableAdminUpgradeabilityProxy");
    const proxy = await Proxy.deploy()

    const isPoolProxyPending = (await poolAddressesProvider.getPool()) === config.ZERO_ADDRESS;
    // Set Pool implementation to Addresses provider and save the proxy deployment artifact at disk
    if (isPoolProxyPending) {
        const setPoolImplTx = await poolAddressesProvider.setPoolImpl(pool.address)
        const txPoolProxyAddress = await poolAddressesProvider.getPool();
        deployments.log(`[Deployment] Attached Pool implementation and deployed proxy contract: `);
        deployments.log("- Tx hash:", setPoolImplTx.transactionHash);
    }

    const poolProxyAddress = await poolAddressesProvider.getPool();
    deployments.log("- Deployed Proxy:", poolProxyAddress);

    const isPoolConfiguratorProxyPending = (await poolAddressesProvider.getPoolConfigurator()) === config.ZERO_ADDRESS;
    // Set Pool Configurator to Addresses Provider proxy deployment 
    if (isPoolConfiguratorProxyPending) {
        const setPoolConfiguratorTx = await poolAddressesProvider.setPoolConfiguratorImpl(poolConfiguratorImplDeployment.address)
        deployments.log(`[Deployment] Attached PoolConfigurator implementation and deployed proxy `);
        deployments.log("- Tx hash:", setPoolConfiguratorTx.transactionHash);
    }

    const poolConfiguratorProxyAddress = await poolAddressesProvider.getPoolConfigurator();
    deployments.log("- Deployed Proxy:", poolConfiguratorProxyAddress);

    let l2Encoder;
    if (config.poolConfig.isL2PoolSupported) {
        // Deploy L2 Encoder
        const L2Encoder = ethers.getContractFactory("L2Encoder");
        l2Encoder = await L2Encoder.deploy(poolProxyAddress)
        console.log(`L2Encoder deployed to ${l2Encoder.address}`)
    }

    // Set Flash Loan premiums
    const PoolConfigurator = await ethers.PoolConfigurator("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: getDeployedContractAddress("configuratorLogic"),
        }
    });
    const poolConfigurator = PoolConfigurator.attach(getDeployedContractAddress("poolConfigurator"));

    // Set total Flash Loan Premium
    await poolConfigurator.updateFlashloanPremiumTotal(config.poolConfig.flashLoanPremiums.total)

    // Set protocol Flash Loan Premium
    await poolConfigurator.updateFlashloanPremiumToProtocol(config.poolConfig.flashLoanPremiums.protocol)

    saveDeploymentInfo(path.basename(__filename), {
        proxy: proxy.address,
        l2Encoder: l2Encoder.address
    })  
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
