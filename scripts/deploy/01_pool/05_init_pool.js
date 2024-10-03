const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress, verify } = require("../../markets")

async function main() {
    const poolLibraries = await getPoolLibraries()
    for (const [key, value] of Object.entries(poolLibraries)) {
        if (value.length == 0) throw new Error(`missing ${key} library address`)
    }

    const Pool = await ethers.getContractFactory("Pool", {
        libraries: {
            ...poolLibraries,
        }
    });
    const poolAddress = getDeployedContractAddress("pool")
    const pool = Pool.attach(poolAddress);

    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    const isPoolProxyPending = (await poolAddressesProvider.getPool()) === config.ZERO_ADDRESS;
    // Set Pool implementation to Addresses provider and save the proxy deployment artifact at disk
    if (isPoolProxyPending) {
        const setPoolImplTx = await poolAddressesProvider.setPoolImpl(pool.address)
        const txPoolProxyAddress = await poolAddressesProvider.getPool();
        console.log(`attached Pool implementation and deployed proxy contract: `);
        console.log("txHash:", setPoolImplTx.transactionHash);
    }

    const poolProxyAddress = await poolAddressesProvider.getPool();
    console.log("deployed Pool Proxy:", poolProxyAddress);

    const isPoolConfiguratorProxyPending = (await poolAddressesProvider.getPoolConfigurator()) === config.ZERO_ADDRESS;
    // Set Pool Configurator to Addresses Provider proxy deployment 
    if (isPoolConfiguratorProxyPending) {
        const setPoolConfiguratorTx = await poolAddressesProvider.setPoolConfiguratorImpl(getDeployedContractAddress("poolConfigurator"))
        console.log(`attached PoolConfigurator implementation and deployed proxy `);
        console.log("txHash:", setPoolConfiguratorTx.transactionHash);
    }

    const poolConfiguratorProxyAddress = await poolAddressesProvider.getPoolConfigurator();
    console.log("deployed poolConfigurator Proxy:", poolConfiguratorProxyAddress);

    let l2Encoder;
    if (config.poolConfig.isL2PoolSupported) {
        // Deploy L2 Encoder
        const L2Encoder = ethers.getContractFactory("L2Encoder");
        l2Encoder = await L2Encoder.deploy(poolProxyAddress)
        console.log(`L2Encoder deployed to ${l2Encoder.address}`)
        await verify(l2Encoder.address, [poolProxyAddress])
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
        poolProxy: poolProxyAddress,
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
