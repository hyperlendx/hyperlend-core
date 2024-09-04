const { ethers } = require("hardhat");
const path = require('path');

const { config, saveDeploymentInfo, getDeployedContractAddress, setDeployedContractAddress } = require("../../markets")

async function main() {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    // Deploy Rate Strategies
    let deployedIRStrategies = []
    for (const strategy in config.rateStrategies) {
        const strategyData = config.rateStrategies[strategy];
        const args = [
            poolAddressesProvider.address,
            strategyData.optimalUsageRatio,
            strategyData.baseVariableBorrowRate,
            strategyData.variableRateSlope1,
            strategyData.variableRateSlope2,
            strategyData.stableRateSlope1,
            strategyData.stableRateSlope2,
            strategyData.baseStableRateOffset,
            strategyData.stableRateExcessOffset,
            strategyData.optimalStableToTotalDebtRatio,
        ];

        const DefaultReserveInterestRateStrategy = await ethers.getContractFactory("DefaultReserveInterestRateStrategy");
        const defaultReserveInterestRateStrategy = await DefaultReserveInterestRateStrategy.deploy(...args) 
        console.log(`Deployed defaultReserveInterestRateStrategy to ${defaultReserveInterestRateStrategy.address}`)
        console.log(`variableSlope1: ${strategyData.variableRateSlope1}, variableSlope2: ${strategyData.variableRateSlope2}`)
        deployedIRStrategies.push(defaultReserveInterestRateStrategy.address)
        setDeployedContractAddress(strategyData.name, defaultReserveInterestRateStrategy.address)
    }

    saveDeploymentInfo(path.basename(__filename), {
        defaultReserveInterestRateStrategy: deployedIRStrategies,
    })  
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
