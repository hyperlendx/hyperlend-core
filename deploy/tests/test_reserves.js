const { ethers } = require("hardhat");
const path = require('path');

const { config, getDeployedContractAddress } = require("../../markets")

async function main() {
    const poolAddress = '0x1e85CCDf0D098a9f55b82F3E35013Eda235C8BD8'    
    const assetAddress = '0x453b63484b11bbF0b61fC7E854f8DAC7bdE7d458'

    const poolLibraries = await getPoolLibraries()
    const Pool = await ethers.getContractFactory("Pool", {
        libraries: {
            ...poolLibraries,
        }
    });    
    const pool = Pool.attach(poolAddress);

    let reserveData = await pool.getReserveData(assetAddress)
    console.log(reserveData)

    const HToken = await ethers.getContractFactory("AToken")
    const hToken = HToken.attach(reserveData.aTokenAddress);
    console.log(`hToken supply`, await hToken.totalSupply())
}

async function getPoolLibraries(){
    return {
        LiquidationLogic: getDeployedContractAddress("liquidationLogic"),
        SupplyLogic: getDeployedContractAddress("supplyLogic"),
        EModeLogic: getDeployedContractAddress("eModeLogic"),
        FlashLoanLogic: getDeployedContractAddress("flashLoanLogic"),
        BorrowLogic: getDeployedContractAddress("borrowLogic"),
        BridgeLogic: getDeployedContractAddress("bridgeLogic"),
        PoolLogic: getDeployedContractAddress("poolLogic"),
    };
};

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
