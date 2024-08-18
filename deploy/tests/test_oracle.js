const { ethers } = require("hardhat");
const path = require('path');

const { config, getDeployedContractAddress } = require("../../markets")

async function main() {
    const oracleAddress = await getDeployedContractAddress("oracle")
    const Oracle = await ethers.getContractFactory("Oracle")
    const oracle = Oracle.attach(oracleAddress);

    for (let assetAddress of config.oracle.assets){
        let asset = await ethers.getContractAt("MintableERC20", assetAddress)
        let sourceAddress = await oracle.getSourceOfAsset(assetAddress)
        let source = await ethers.getContractAt("AggregatorInterface", sourceAddress);

        console.log(`Asset: ${await asset.symbol()}, price source: ${await source.description()}`)
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
