const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress, verify } = require("../../markets")

async function main() {
    const weth =  "" 
    const pool = getDeployedContractAddress("poolProxy")

    if (weth.length == 0){
        throw new Error("missing WETH address")
    }
    if (pool.length == 0){
        throw new Error("missing pool address")
    }

    const WrappedTokenGateway = await ethers.getContractFactory("WrappedTokenGatewayV3");
    const wrappedTokenGateway = await WrappedTokenGateway.deploy(weth, config.poolAddressesProvider_owner, pool);
    console.log(`wrappedTokenGateway deployed to ${wrappedTokenGateway.address}, using ${weth} WETH and ${pool} pool`);
    await verify(wrappedTokenGateway.address, [weth, config.poolAddressesProvider_owner, pool])

    saveDeploymentInfo(path.basename(__filename), {
        wrappedTokenGateway: wrappedTokenGateway.address,
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
