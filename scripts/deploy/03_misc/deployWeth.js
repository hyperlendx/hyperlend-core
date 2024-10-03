const { ethers } = require("hardhat");
const path = require('path');

const { saveDeploymentInfo, verify } = require("../../markets")

async function main() {
    const WETH = await ethers.getContractFactory("WETH9");
    const weth = await WETH.deploy();
    console.log(`WETH deployed to ${weth.address}`)
    await verify(weth.address, [])

    saveDeploymentInfo(path.basename(__filename), {
        weth: weth.address,
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
