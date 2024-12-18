const { ethers } = require("hardhat");
const path = require('path');

async function main({ saveDeploymentInfo, verify }) {
    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    console.log(`WETH deployed to ${weth.target}`)
    await verify(weth.target, [])

    saveDeploymentInfo(path.basename(__filename), {
        WETH9: weth.target,
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
