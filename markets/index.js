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
            "0xF8b76b29A7fcd23A2A44a23CaEe298f4afCB0Ebd"
        ],
        sources: [
            "0xF8b76b29A7fcd23A2A44a23CaEe298f4afCB0Ebd"
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
        DAI: "0x00a7095e063859D73F6154C945d7F47C42B4A3f2",
        LINK: "0x9E72BFA05F9857ab605594aDa74EC0be8bd6Ae81",
    },
    market: {
        MarketId: "Testnet Hyperlend Market",
        ATokenNamePrefix: "Testnet",
        StableDebtTokenNamePrefix: "Testnet",
        VariableDebtTokenNamePrefix: "Testnet",
        SymbolPrefix: "Tst",
        ProviderId: 36,
        ReservesConfig: {
            DAI:  {
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
            arbitrum: {
                DAI: "0x00a7095e063859D73F6154C945d7F47C42B4A3f2",
                LINK: "0x9E72BFA05F9857ab605594aDa74EC0be8bd6Ae81",
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
            arbitrum: {
                LINK: "0x86E53CF1B870786351Da77A57575e79CB55812CB",
                USDC: "0x50834F3163758fcC1Df9973b6e91f0F0F0434aD3",
                DAI: "0xc5C8E77B397E531B8EC06BFb0048328B30E9eCfB",
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