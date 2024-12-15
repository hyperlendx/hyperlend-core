const { ethers } = require("hardhat");
const path = require('path');
const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { config, saveDeploymentInfo, getDeployedContractAddress, verify } = require("../markets")

async function main() {
    console.log(`ONLY USE DURING TESTING - NEVER USE HOT WALLETS IN PROD!`)
    
    const oracleAddress = getDeployedContractAddress("oracle")
    if (oracleAddress.length == 0) throw new Error(`missing oracle address`)
    
    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = Oracle.attach(oracleAddress);
    
    const assets = ["0xe2FbC9cB335A65201FcDE55323aE0F4E8A96A616"]
    const sources = ["0x2bd27d573d12D5843E983F716224C2b8e5aa0C5F"]

    for (let i in assets){
        let asset = await ethers.getContractAt("MintableERC20", assets[i])
        let source = await ethers.getContractAt("AggregatorInterface", sources[i]);

        console.log(`Asset: ${await asset.symbol()}, source price: ${await source.latestAnswer()}`)
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
