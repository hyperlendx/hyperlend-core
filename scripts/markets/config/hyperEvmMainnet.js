const { ethers } = require("hardhat")
const fs = require("fs")

//HyperEVM testnet Market Config
const config = {
    WETH: null,
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    ZERO_BYTES_32: "0x0000000000000000000000000000000000000000000000000000000000000000",
    poolAddressesProviderRegistry_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolAddressesProvider_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    treasuryAddress: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolConfig: {
        marketId: "HyperLend Core Market",
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
        ],
        sources: [
        ],
        fallbackOracleAddress: "0x0000000000000000000000000000000000000000",
        baseCurrencyUnit: "100000000"
    },
    incentivesController: "0x0000000000000000000000000000000000000000",
    rateStrategies: [
        {
            name: "rateStrategyVolatileOne",
            optimalUsageRatio: ethers.parseUnits("0.45", 27).toString(),
            baseVariableBorrowRate: "0",
            variableRateSlope1: ethers.parseUnits("0.04", 27).toString(),
            variableRateSlope2: ethers.parseUnits("3", 27).toString(),
            stableRateSlope1: ethers.parseUnits("0.07", 27).toString(),
            stableRateSlope2: ethers.parseUnits("3", 27).toString(),
            baseStableRateOffset: ethers.parseUnits("0.02", 27).toString(),
            stableRateExcessOffset: ethers.parseUnits("0.05", 27).toString(),
            optimalStableToTotalDebtRatio: ethers.parseUnits("0.2", 27).toString(),
        },
        {
            name: "rateStrategyStableOne",
            optimalUsageRatio: ethers.parseUnits("0.80", 27).toString(),
            baseVariableBorrowRate: "0",
            variableRateSlope1: ethers.parseUnits("0.04", 27).toString(),
            variableRateSlope2: ethers.parseUnits("0.75", 27).toString(),
            stableRateSlope1: ethers.parseUnits("0.005", 27).toString(),
            stableRateSlope2: ethers.parseUnits("0.75", 27).toString(),
            baseStableRateOffset: ethers.parseUnits("0.02", 27).toString(),
            stableRateExcessOffset: ethers.parseUnits("0.05", 27).toString(),
            optimalStableToTotalDebtRatio: ethers.parseUnits("0.2", 27).toString(),
        }
    ],
    tokenAddresses: {
        WETH: ""
    },
    market: {
        MarketId: "HyperEVM HyperLend Market",
        ATokenNamePrefix: "HyperEVM",
        StableDebtTokenNamePrefix: "HyperEVM",
        VariableDebtTokenNamePrefix: "HyperEVM",
        SymbolPrefix: "HyperEvm",
        ProviderId: "1",
        ReservesConfig: {
            WETH: {
                strategy: {
                    name: "rateStrategyVolatileOne"
                },
                baseLTVAsCollateral: "7500",
                liquidationThreshold: "8000",
                liquidationBonus: "11000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: false,
                flashLoanEnabled: true,
                reserveDecimals: "18",
                aTokenImpl: "AToken",
                reserveFactor: "2000",
                supplyCap: "1000",
                borrowCap: "0",
                debtCeiling: "0",
                borrowableIsolation: false,
                seedAmount: "100000000000000000" //0.1
            }
        }
    },
    strategyAddresses: { },
    _networkBaseTokenPriceInUsdProxyAggregator: "", //ETH / USD chainlink
    _marketReferenceCurrencyPriceInUsdProxyAggregator: "" //ETH/USD
}

module.exports = {
    config: config
}