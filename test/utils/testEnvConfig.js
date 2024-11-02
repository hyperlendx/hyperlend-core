const deployedContracts = {};

async function makeConfig({ getDeployedContractAddress }){
    const [owner] = await ethers.getSigners();

    let assetAddress = await getDeployedContractAddress("mockERC20")
    let assetOraclePriceSource = await getDeployedContractAddress("mockHyperEvmOracleProxy")

    let config = {
        isTestEnv: true,
        WETH: null,
        ZERO_ADDRESS: "0x0000000000000000000000000000000000000000",
        ZERO_BYTES_32: "0x0000000000000000000000000000000000000000000000000000000000000000",
        poolAddressesProviderRegistry_owner: owner.address,
        poolAddressesProvider_owner: owner.address,
        poolConfig: {
            marketId: "HyperLend Test Environment Pool",
            providerId: "1",
            isL2PoolSupported: false,
            flashLoanPremiums: {
                total: 5,
                protocol: 4
            }
        },
        acl: {
            aclAdmin: owner.address,
            poolAdmin: owner.address,
            emergencyAdmin: owner.address
        },
        oracle: {
            assets: [
                assetAddress
            ],
            sources: [
                assetOraclePriceSource
            ],
            fallbackOracleAddress: "0x0000000000000000000000000000000000000000",
            baseCurrencyUnit: "100000000"
        },
        treasuryAddress: owner.address,
        incentivesController: "0x0000000000000000000000000000000000000000",
        reservesAddresses: {},
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
            }
        ],
        tokenAddresses: {
            MOCK: assetAddress
        },
        market: {
            MarketId: "HyperLend Test Environment Market",
            ATokenNamePrefix: "HyperLend TestEnv",
            StableDebtTokenNamePrefix: "HyperLend TestEnv",
            VariableDebtTokenNamePrefix: "HyperLend TestEnv",
            SymbolPrefix: "HPLTestEnv",
            ProviderId: "1",
            ReservesConfig: {
                MOCK: {
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
                    seedAmount: "10000000"
                }
            }
        },
        strategyAddresses: { }
    }

    return config;
}

function getDeployedContractAddress(id){
    return id ? 
        (deployedContracts[id] ? deployedContracts[id] : "")
        : deployedContracts;
}

async function setDeployedContractAddress(id, address){
    deployedContracts[id] = address;
}

async function saveDeploymentInfo(name, data){
    for (let [key, value] of Object.entries(data)){
        deployedContracts[key] = value;
    }
}

//intentionally left empty
function verify(){}

module.exports = {
    makeConfig: makeConfig,
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo,
    verify: verify
}