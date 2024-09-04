const { ethers } = require("hardhat");
const path = require('path');

const { config, getDeployedContractAddress } = require("../../markets")

async function main() {
    const contract = '0xFf377dbB97c674Bfa201d8CdcAe597D1231317Ea'
    
    const RateStrategy = await ethers.getContractFactory("DefaultReserveInterestRateStrategy")
    const rateStrategy = RateStrategy.attach(contract);

    console.log(await rateStrategy.getVariableRateSlope2())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
