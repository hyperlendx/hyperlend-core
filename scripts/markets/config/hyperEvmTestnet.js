const { ethers } = require("hardhat")
const fs = require("fs")

//HyperEVM testnet Market Config
const config = {
    WETH: null,
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    ZERO_BYTES_32: "0x0000000000000000000000000000000000000000000000000000000000000000",
    poolAddressesProviderRegistry_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolAddressesProvider_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolConfig: {
        marketId: "HyperLend HyperEVM Testnet Market",
        providerId: "1",
        isL2PoolSupported: false,
        flashLoanPremiums: {
            total: 5,
            protocol: 4
        }
    },
    acl: {
        aclAdmin: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
        poolAdmin: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
        emergencyAdmin: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D"
    },
    oracle: {
        assets: [
            "0x453b63484b11bbF0b61fC7E854f8DAC7bdE7d458", //mockBTC
        ],
        sources: [
            "0x3437aE65ae0C2b80437E55c829fF6C895Eee061c", //mockBTC/usd
        ],
        fallbackOracleAddress: "0x0000000000000000000000000000000000000000",
        baseCurrencyUnit: "100000000"
    },
    treasuryAddress: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    incentivesController: "0x0000000000000000000000000000000000000000",
    reservesAddresses: {},
    rateStrategies: [
        {
            name: "rateStrategyVolatileOne",
            optimalUsageRatio: ethers.utils.parseUnits("0.45", 27).toString(),
            baseVariableBorrowRate: "0",
            variableRateSlope1: ethers.utils.parseUnits("0.04", 27).toString(),
            variableRateSlope2: ethers.utils.parseUnits("3", 27).toString(),
            stableRateSlope1: ethers.utils.parseUnits("0.07", 27).toString(),
            stableRateSlope2: ethers.utils.parseUnits("3", 27).toString(),
            baseStableRateOffset: ethers.utils.parseUnits("0.02", 27).toString(),
            stableRateExcessOffset: ethers.utils.parseUnits("0.05", 27).toString(),
            optimalStableToTotalDebtRatio: ethers.utils.parseUnits("0.2", 27).toString(),
        },
        {
            name: "rateStrategyStableOne",
            optimalUsageRatio: ethers.utils.parseUnits("0.80", 27).toString(),
            baseVariableBorrowRate: "0",
            variableRateSlope1: ethers.utils.parseUnits("0.04", 27).toString(),
            variableRateSlope2: ethers.utils.parseUnits("0.75", 27).toString(),
            stableRateSlope1: ethers.utils.parseUnits("0.005", 27).toString(),
            stableRateSlope2: ethers.utils.parseUnits("0.75", 27).toString(),
            baseStableRateOffset: ethers.utils.parseUnits("0.02", 27).toString(),
            stableRateExcessOffset: ethers.utils.parseUnits("0.05", 27).toString(),
            optimalStableToTotalDebtRatio: ethers.utils.parseUnits("0.2", 27).toString(),
        }
    ],
    tokenAddresses: {
        MBTC: "0x453b63484b11bbF0b61fC7E854f8DAC7bdE7d458", 
    },
    market: {
        MarketId: "HyperEVM Testnet HyperLend Market",
        ATokenNamePrefix: "HyperEVM Testnet",
        StableDebtTokenNamePrefix: "HyperEVM Testnet",
        VariableDebtTokenNamePrefix: "HyperEVM Testnet",
        SymbolPrefix: "HyperEvmTest",
        ProviderId: "1",
        ReservesConfig: {
            MBTC: {
                strategy: {
                    name: "rateStrategyVolatileOne"
                },
                baseLTVAsCollateral: "7500",
                liquidationThreshold: "8000",
                liquidationBonus: "11000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: false,
                flashLoanEnabled: true,
                reserveDecimals: "8",
                aTokenImpl: "AToken",
                reserveFactor: "2000",
                supplyCap: "1000",
                borrowCap: "0",
                debtCeiling: "0",
                borrowableIsolation: false,
                seedAmount: "10000000" //0.1
            }
        }
    },
    strategyAddresses: { }
}

module.exports = {
    config: config
}