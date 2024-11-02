const { ethers } = require("hardhat");

async function main({ setDeployedContractAddress }) {
    const MintableERC20 = await ethers.getContractFactory("MockERC20");
    const mock = await MintableERC20.deploy("MockToken", "MOCK", 18);
    console.log(`mockERC20 deployed to ${mock.target}`)

    setDeployedContractAddress("mockERC20", mock.target)
}

module.exports = main
