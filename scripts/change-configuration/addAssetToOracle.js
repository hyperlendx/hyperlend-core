const { ethers } = require("hardhat");
const path = require('path');
const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { config, saveDeploymentInfo, getDeployedContractAddress, verify } = require("../markets")

async function main() {
    const oracleAddress = getDeployedContractAddress("oracle")
    if (oracleAddress.length == 0) throw new Error(`missing oracle address`)
    
    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = Oracle.attach(oracleAddress);
    
    const assets = ["0xe0bdd7e8b7bf5b15dcDA6103FCbBA82a460ae2C7"]
    const sources = ["0xc88F13B22443E6dDe99bc702F0130A8edee45174"]

    for (let i in assets){
        let asset = await ethers.getContractAt("MintableERC20", assets[i])
        let source = await ethers.getContractAt("AggregatorInterface", sources[i]);

        console.log(`Asset: ${await asset.symbol()}, price source: ${await source.description()}`)
    }

    let isCorrect = await askForConfirmation()
    if (!isCorrect){
        console.log("Aborting...")
        return;
    }

    await oracle.setAssetSources(assets, sources)
    console.log(`Assets ${assets} with sources ${sources} added to oracle`)

    for (let assetAddress of assets){
        let asset = await ethers.getContractAt("MintableERC20", assetAddress)
        let sourceAddress = await oracle.getSourceOfAsset(assetAddress)
        let source = await ethers.getContractAt("AggregatorInterface", sourceAddress);

        console.log(`Asset: ${await asset.symbol()}, price source: ${await source.description()}`)
        console.log(`Price: ${await oracle.getAssetPrice(assetAddress)}, normalized: ${await oracle.getAssetPrice(assetAddress) / Math.pow(10, 8)}`)
    }
}

async function askForConfirmation(){
    return new Promise((resolve, reject) => {
        rl.question(`Is this correct [y/n]?`, res => {
            rl.close();
            if (res.toLowerCase() == "y"){
                resolve(true)
            } else {
                resolve(false)
            }
        });
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
