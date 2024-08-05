const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    const poolLibraries = await getPoolLibraries()

    const Pool = await ethers.getContractFactory("Pool", {
        libraries: {
            ...poolLibraries,
        }
    });
    const pool = Pool.attach(getDeployedContractAddress("pool"));

    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    const isPoolProxyPending = (await poolAddressesProvider.getPool()) === config.ZERO_ADDRESS;
    // Set Pool implementation to Addresses provider and save the proxy deployment artifact at disk
    if (isPoolProxyPending) {
        const setPoolImplTx = await poolAddressesProvider.setPoolImpl(pool.address)
        const txPoolProxyAddress = await poolAddressesProvider.getPool();
        console.log(`[Deployment] Attached Pool implementation and deployed proxy contract: `);
        console.log("- Tx hash:", setPoolImplTx.transactionHash);
    }

    const poolProxyAddress = await poolAddressesProvider.getPool();
    console.log("- Deployed Pool Proxy:", poolProxyAddress);

    const isPoolConfiguratorProxyPending = (await poolAddressesProvider.getPoolConfigurator()) === config.ZERO_ADDRESS;
    // Set Pool Configurator to Addresses Provider proxy deployment 
    if (isPoolConfiguratorProxyPending) {
        const setPoolConfiguratorTx = await poolAddressesProvider.setPoolConfiguratorImpl(getDeployedContractAddress("poolConfigurator"))
        console.log(`[Deployment] Attached PoolConfigurator implementation and deployed proxy `);
        console.log("- Tx hash:", setPoolConfiguratorTx.transactionHash);
    }

    const poolConfiguratorProxyAddress = await poolAddressesProvider.getPoolConfigurator();
    console.log("- Deployed poolConfigurator Proxy:", poolConfiguratorProxyAddress);

    let l2Encoder;
    if (config.poolConfig.isL2PoolSupported) {
        // Deploy L2 Encoder
        const L2Encoder = ethers.getContractFactory("L2Encoder");
        l2Encoder = await L2Encoder.deploy(poolProxyAddress)
        console.log(`L2Encoder deployed to ${l2Encoder.address}`)
    }

    // Set Flash Loan premiums
    const PoolConfigurator = await ethers.getContractFactory("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: getDeployedContractAddress("configuratorLogic"),
        }
    });
    const poolConfigurator = PoolConfigurator.attach(poolConfiguratorProxyAddress);

    // Set total Flash Loan Premium
    await poolConfigurator.updateFlashloanPremiumTotal(config.poolConfig.flashLoanPremiums.total)

    // Set protocol Flash Loan Premium
    await poolConfigurator.updateFlashloanPremiumToProtocol(config.poolConfig.flashLoanPremiums.protocol)

    saveDeploymentInfo(path.basename(__filename), {
        // proxy: proxy.address,
        l2Encoder: l2Encoder ? l2Encoder.address : null,
        poolConfiguratorProxy: poolConfiguratorProxyAddress
    })  
}

async function getPoolLibraries(){
    return {
        LiquidationLogic: getDeployedContractAddress("liquidationLogic"),
        SupplyLogic: getDeployedContractAddress("supplyLogic"),
        EModeLogic: getDeployedContractAddress("eModeLogic"),
        FlashLoanLogic: getDeployedContractAddress("flashLoanLogic"),
        BorrowLogic: getDeployedContractAddress("borrowLogic"),
        BridgeLogic: getDeployedContractAddress("bridgeLogic"),
        PoolLogic: getDeployedContractAddress("poolLogic"),
    };
};


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
