const { ethers } = require("hardhat")
const fs = require("fs")

//Arbitrum Market Config
const config = {
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    ZERO_BYTES_32: "0x0000000000000000000000000000000000000000000000000000000000000000",
    poolAddressesProviderRegistry_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolAddressesProvider_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolConfig: {
        marketId: "HyperLend Arbitrum Market",
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
            "0xaf88d065e77c8cc2239327c5edb3a432268e5831", //usdc
            "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", //weth
            "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", //wbtc
            "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9" //usdt
        ],
        sources: [
            "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3", //usdc/usd
            "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612", //eth/usd
            "0x6ce185860a4963106506C203335A2910413708e9", //wbtc/usd
            "0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7" //usdt/usd
        ],
        fallbackOracleAddress: "0x0000000000000000000000000000000000000000",
        baseCurrencyUnit: "100000000"
    },
    treasuryAddress: "0x76A99A03c44eEAe3f596017BBA48647A69A429c9",
    incentivesController: "0x0000000000000000000000000000000000000000",
    reservesAddresses: {},
    rateStrategies: [{
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
    }, {
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
    }],
    tokenAddresses: {
        USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        WBTC: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", 
        USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9" 
    },
    market: {
        MarketId: "Arbitrum HyperLend Market",
        ATokenNamePrefix: "Arbitrum",
        StableDebtTokenNamePrefix: "Arbitrum",
        VariableDebtTokenNamePrefix: "Arbitrum",
        SymbolPrefix: "Arb",
        ProviderId: "1",
        ReservesConfig: {
            USDC:  {
                strategy: {
                    name: "rateStrategyStableOne"
                },
                baseLTVAsCollateral: "8000",
                liquidationThreshold: "8500",
                liquidationBonus: "15000",
                liquidationProtocolFee: "5000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: true,
                flashLoanEnabled: true,
                reserveDecimals: "6",
                aTokenImpl: "AToken",
                reserveFactor: "2000",
                supplyCap: "2000000000",
                borrowCap: "0",
                debtCeiling: "0",
                borrowableIsolation: true,
                seedAmount: "1000000"
            },
            WETH: {
                strategy: {
                    name: "rateStrategyVolatileOne"
                },
                baseLTVAsCollateral: "7500",
                liquidationThreshold: "8000",
                liquidationBonus: "15000",
                liquidationProtocolFee: "5000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: false,
                flashLoanEnabled: true,
                reserveDecimals: "18",
                aTokenImpl: "AToken",
                reserveFactor: "2000",
                supplyCap: "0",
                borrowCap: "0",
                debtCeiling: "0",
                borrowableIsolation: false,
                seedAmount: "500000000000000" //0.0005
            },
            WBTC: {
                strategy: {
                    name: "rateStrategyVolatileOne"
                },
                baseLTVAsCollateral: "7500",
                liquidationThreshold: "8000",
                liquidationBonus: "15000",
                liquidationProtocolFee: "5000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: false,
                flashLoanEnabled: true,
                reserveDecimals: "8",
                aTokenImpl: "AToken",
                reserveFactor: "2000",
                supplyCap: "0",
                borrowCap: "0",
                debtCeiling: "0",
                borrowableIsolation: false,
                seedAmount: "2000" //0.00002
            },
            USDT: {
                strategy: {
                    name: "rateStrategyStableOne"
                },
                baseLTVAsCollateral: "8000",
                liquidationThreshold: "8500",
                liquidationBonus: "15000",
                liquidationProtocolFee: "5000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: true,
                flashLoanEnabled: true,
                reserveDecimals: "6",
                aTokenImpl: "AToken",
                reserveFactor: "2000",
                supplyCap: "2000000000",
                borrowCap: "0",
                debtCeiling: "500000000",
                borrowableIsolation: true,
                seedAmount: "1000000"
            }
        },
        ReserveAssets: {
            arbitrumTestnet: {
                USDC: "0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d",
                WETH: "0x1dF462e2712496373A347f8ad10802a5E95f053D"
            },
            arbitrum: {
                USDC: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
                WETH: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
                WBTC: "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f", 
                USDT: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9" 
            }
        },
        EModes: {
            StableEMode: {
                id: "1",
                ltv: "9300",
                liquidationThreshold: "9500",
                liquidationBonus: "10000",
                label: "Stablecoins",
                assets: ["USDC", "USDT"],
            },
        },
        ChainlinkAggregator: {
            arbitrumTestnet: {
                USDC: "0x0153002d20B96532C639313c2d54c3dA09109309",
                WETH: "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"
            }
        }
    },
    strategyAddresses: { }
}

let deployedContracts = JSON.parse(fs.readFileSync("./markets/deployedContracts.json"))

function getDeployedContractAddress(id){
    return deployedContracts[id]
}

async function setDeployedContractAddress(id, address){
    deployedContracts[id] = address
    deployedContractsChanged()
}

async function saveDeploymentInfo(name, data){
    //path.basename(__filename) + on = file.json
    fs.writeFileSync(`./deployments/${name}on`, JSON.stringify(data))

    for (let [key, value] of Object.entries(data)){
        deployedContracts[key] = value
    }

    deployedContractsChanged()
}

function deployedContractsChanged(){
    fs.writeFileSync("./markets/deployedContracts.json", JSON.stringify(deployedContracts, null, 4))
}

module.exports = {
    config: config,
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo
}