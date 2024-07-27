const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

const poolAddressesProvider = getDeployedContractAddress("poolAddressesProvider")

async function main() {
    const PoolConfigurator = await ethers.PoolConfigurator("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: getDeployedContractAddress("configuratorLogic"),
        }
    });
    const poolConfigurator = await PoolConfigurator.deploy();
    console.log(`poolConfigurator deployed to ${poolConfigurator.address}`);

    await poolConfigurator.initialize(poolAddressesProvider);

    const ReservesSetupHelper = await ethers.PoolConfigurator("ReservesSetupHelper");
    const reservesSetupHelper = await ReservesSetupHelper.deploy()
    console.log(`reservesSetupHelper deployed to ${reservesSetupHelper.address}`);

    saveDeploymentInfo(path.basename(__filename), {
        poolConfigurator: poolConfigurator.address,
        reservesSetupHelper: reservesSetupHelper.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
