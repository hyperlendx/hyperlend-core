const { ethers } = require("hardhat")
const fs = require("fs")

const config = {
    ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
    ZERO_BYTES_32: "0x0000000000000000000000000000000000000000000000000000000000000000",
    poolAddressesProviderRegistry_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolAddressesProvider_owner: "0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D",
    poolConfig: {
        marketId: 1,
        providerId: 2,
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
            "0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d", //usdc
            "0x1dF462e2712496373A347f8ad10802a5E95f053D" //weth
        ],
        sources: [
            "0x0153002d20B96532C639313c2d54c3dA09109309", //usdc/usd
            "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165" //eth/usd
        ],
        fallbackOracleAddress: "0x0000000000000000000000000000000000000000",
        baseCurrencyUnit: "100000000"
    },
    treasuryAddress: "0x0000000000000000000000000000000000000000",
    incentivesController: "0x0000000000000000000000000000000000000000",
    reservesAddresses: {},
    rateStrategies: [{
        name: "rateStrategyVolatileOne",
        optimalUsageRatio: ethers.utils.parseUnits("0.45", 27).toString(),
        baseVariableBorrowRate: "0",
        variableRateSlope1: ethers.utils.parseUnits("0.07", 27).toString(),
        variableRateSlope2: ethers.utils.parseUnits("3", 27).toString(),
        stableRateSlope1: ethers.utils.parseUnits("0.07", 27).toString(),
        stableRateSlope2: ethers.utils.parseUnits("3", 27).toString(),
        baseStableRateOffset: ethers.utils.parseUnits("0.02", 27).toString(),
        stableRateExcessOffset: ethers.utils.parseUnits("0.05", 27).toString(),
        optimalStableToTotalDebtRatio: ethers.utils.parseUnits("0.2", 27).toString(),
    }],
    tokenAddresses: {
        USDC: "0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d",
        WETH: "0x1dF462e2712496373A347f8ad10802a5E95f053D"
    },
    market: {
        MarketId: "Arbitrum Testnet Hyperlend Market",
        ATokenNamePrefix: "Arbitrum Testnet",
        StableDebtTokenNamePrefix: "Arbitrum Testnet",
        VariableDebtTokenNamePrefix: "Arbitrum Testnet",
        SymbolPrefix: "ArbTst",
        ProviderId: 36,
        ReservesConfig: {
            USDC:  {
                strategy: {
                    name: "rateStrategyVolatileOne"
                },
                baseLTVAsCollateral: "7500",
                liquidationThreshold: "8000",
                liquidationBonus: "10500",
                liquidationProtocolFee: "1000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: true,
                flashLoanEnabled: true,
                reserveDecimals: "18",
                aTokenImpl: "AToken",
                reserveFactor: "1000",
                supplyCap: "2000000000",
                borrowCap: "0",
                debtCeiling: "0",
                borrowableIsolation: true,
            },
            WETH: {
                strategy: {
                    name: "rateStrategyVolatileOne"
                },
                baseLTVAsCollateral: "7500",
                liquidationThreshold: "8000",
                liquidationBonus: "10500",
                liquidationProtocolFee: "1000",
                borrowingEnabled: true,
                stableBorrowRateEnabled: true,
                flashLoanEnabled: true,
                reserveDecimals: "18",
                aTokenImpl: "AToken",
                reserveFactor: "1000",
                supplyCap: "2000000000",
                borrowCap: "0",
                debtCeiling: "0",
                borrowableIsolation: true,
            }
        },
        ReserveAssets: {
            arbitrumTestnet: {
                USDC: "0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d",
                WETH: "0x1dF462e2712496373A347f8ad10802a5E95f053D"
            }
        },
        EModes: {
            StableEMode: {
                id: "1",
                ltv: "9700",
                liquidationThreshold: "9750",
                liquidationBonus: "10100",
                label: "Stablecoins",
                assets: ["USDC", "USDT", "DAI", "EURS"],
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