const { ethers } = require("hardhat");

async function main({ setDeployedContractAddress }, assetAddress, assetPrice) {
    const MockOracleProxy = await ethers.getContractFactory("MockHyperEvmOracleProxy");
    const oracleProxy = await MockOracleProxy.deploy("MOCK/USD", 8, assetAddress, assetPrice);
    console.log(`mockHyperEvmOracleProxy deployed to ${oracleProxy.target}`)
    
    setDeployedContractAddress("mockHyperEvmOracleProxy", oracleProxy.target)
}

module.exports = main
