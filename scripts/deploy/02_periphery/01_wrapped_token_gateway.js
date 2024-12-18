const { ethers } = require("hardhat");
const path = require('path');

async function main({ config, saveDeploymentInfo, getDeployedContractAddress, verify }) {
    const weth = config.WETH || getDeployedContractAddress("weth")
    const pool = getDeployedContractAddress("poolProxy")

    if (!weth || weth.length == 0){
        throw new Error("missing WETH address")
    }
    if (!pool || pool.length == 0){
        throw new Error("missing pool address")
    }

    const WrappedTokenGateway = await ethers.getContractFactory("WrappedTokenGatewayV3");
    const wrappedTokenGateway = await WrappedTokenGateway.deploy(weth, config.poolAddressesProvider_owner, pool);
    console.log(`wrappedTokenGateway deployed to ${wrappedTokenGateway.target}, using ${weth} WETH and ${pool} pool`);
    await verify(wrappedTokenGateway.target, [weth, config.poolAddressesProvider_owner, pool])

    saveDeploymentInfo(path.basename(__filename), {
        wrappedTokenGateway: wrappedTokenGateway.target,
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
