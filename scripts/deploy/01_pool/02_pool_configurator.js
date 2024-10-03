const { ethers } = require("hardhat");
const path = require('path');

const { saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    const configuratorLogicAddress = getDeployedContractAddress("configuratorLogic")
    if (configuratorLogicAddress.length == 0) throw new Error(`missing configuratorLogic address`)

    //deploy pool configurator
    const PoolConfigurator = await ethers.getContractFactory("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: configuratorLogicAddress,
        }
    });
    const poolConfigurator = await PoolConfigurator.deploy();
    console.log(`poolConfigurator deployed to ${poolConfigurator.address}`);

    //initialize pool configurator
    const poolAddressesProviderAddress = getDeployedContractAddress("poolAddressesProvider")
    if (poolAddressesProviderAddress.length == 0) throw new Error(`missing poolAddressesProvider address`)

    await poolConfigurator.initialize(poolAddressesProviderAddress);
    console.log(`poolConfigurator initialized using ${poolAddressesProviderAddress} poolAddressesProvider`)

    //deploy resevers setup helper
    const ReservesSetupHelper = await ethers.getContractFactory("ReservesSetupHelper");
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
