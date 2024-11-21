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

    const asset = '0xe0bdd7e8b7bf5b15dcDA6103FCbBA82a460ae2C7'
    const newCap = '6000' //in full asset amount, e.g. 100 BTC = 100, NOT 100 * 10**decimals

    await poolConfigurator.setSupplyCap(asset, newCap);
    console.log(`Supply cap set to ${newCap}`)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
