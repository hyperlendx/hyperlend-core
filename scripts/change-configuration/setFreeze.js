const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress, setDeployedContractAddress } = require("../markets")

async function main() {
    console.log(`ONLY USE DURING TESTING - NEVER USE HOT WALLETS IN PROD!`)

    const PoolConfigurator = await ethers.getContractFactory("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: getDeployedContractAddress("configuratorLogic"),
        }
    });    
    const poolConfigurator = PoolConfigurator.attach(getDeployedContractAddress("poolConfiguratorProxy"));

    const freeze = false
    const asset = '0x4D6b8f9518b0b92080b5eAAf80bD505734A059Ae'

    await poolConfigurator.setReserveFreeze(asset, freeze);
    console.log(`Reserve ${asset} freeze set to ${freeze}`)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
