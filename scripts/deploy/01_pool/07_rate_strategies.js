const { ethers } = require("hardhat");
const path = require('path');

async function main({ config, saveDeploymentInfo, getDeployedContractAddress, setDeployedContractAddress, verify }) {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));

    // Deploy Rate Strategies
    let deployedIRStrategies = []
    for (const strategy in config.rateStrategies) {
        const strategyData = config.rateStrategies[strategy];
        const args = [
            poolAddressesProvider.target,
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
        console.log(`defaultReserveInterestRateStrategy deployed to ${defaultReserveInterestRateStrategy.target}`)
        console.log(`variableSlope1: ${strategyData.variableRateSlope1}, variableSlope2: ${strategyData.variableRateSlope2}`)
        await verify(defaultReserveInterestRateStrategy.target, args)
        deployedIRStrategies.push(defaultReserveInterestRateStrategy.target)
        setDeployedContractAddress(strategyData.name, defaultReserveInterestRateStrategy.target)
    }

    saveDeploymentInfo(path.basename(__filename), {
        defaultReserveInterestRateStrategy: deployedIRStrategies,
    })  
}

module.exports = main
