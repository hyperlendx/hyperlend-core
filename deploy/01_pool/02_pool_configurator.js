const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

async function main() {
    const PoolConfigurator = await ethers.getContractFactory("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: getDeployedContractAddress("configuratorLogic"),
        }
    });
    const poolConfigurator = await PoolConfigurator.deploy();
    console.log(`poolConfigurator deployed to ${poolConfigurator.address}`);

    await poolConfigurator.initialize(getDeployedContractAddress("poolAddressesProvider"));

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
