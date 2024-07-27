const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress, setDeployedContractAddress } = require("../../markets")

async function main() {
    const MintableERC20 = await ethers.getContractFactory("MintableERC20");
    const mock1 = await MintableERC20.deploy("MOCK1", "MOCK1", 6);
    const mock2 = await MintableERC20.deploy("MOCK2", "MOCK2", 18);
    console.log(mock1.address, mock2.address)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
