const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress, setDeployedContractAddress } = require("../../markets")

async function main() {
    const MintableERC20 = await ethers.getContractFactory("MockERC20");
    const mock1 = await MintableERC20.deploy("mockETH", "METH", 18);
    const mock2 = await MintableERC20.deploy("mockBTC", "MBTC", 8);
    console.log(mock1.address, mock2.address)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
