const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress, setDeployedContractAddress } = require("../testnet-deploy/index.js")

async function main() {
    console.log(`ONLY USE DURING TESTING - NEVER USE HOT WALLETS IN PROD!`)

    const PoolConfigurator = await ethers.getContractFactory("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: getDeployedContractAddress("configuratorLogic"),
        }
    });    
    const poolConfigurator = PoolConfigurator.attach(getDeployedContractAddress("poolConfiguratorProxy"));

    const asset = '0xe2FbC9cB335A65201FcDE55323aE0F4E8A96A616'
    const newCap = '1' //in full asset amount, e.g. 100 BTC = 100, NOT 100 * 10**decimals

    await poolConfigurator.setSupplyCap(asset, newCap);
    console.log(`Supply cap set to ${newCap}`)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
