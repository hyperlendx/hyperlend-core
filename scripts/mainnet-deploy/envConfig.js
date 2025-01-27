const path = require("path");
const fs = require("fs")

const verificationScript = require("../utils/verify")

const deployedContracts = {};

const RUN_VERIFICATION_LIVE = true;

async function makeConfig(){
    let config = {
        isTestEnv: false,
        WETH: "0xADcb2f358Eae6492F61A5F87eb8893d09391d160",
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
                // "0xADcb2f358Eae6492F61A5F87eb8893d09391d160"
            ],
            sources: [
                // "0x062eAE387007b15723af7b876A88d77dFF96EE63"
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
            WETH: "0xADcb2f358Eae6492F61A5F87eb8893d09391d160"
        },
        market: {
            MarketId: "HyperEVM HyperLend Market",
            ATokenNamePrefix: "HyperEVM",
            StableDebtTokenNamePrefix: "HyperEVM",
            VariableDebtTokenNamePrefix: "HyperEVM",
            SymbolPrefix: "HyperEvm",
            ProviderId: "1",
            ReservesConfig: {
                // WETH: {
                //     strategy: {
                //         name: "rateStrategyVolatileOne"
                //     },
                //     baseLTVAsCollateral: "7500",
                //     liquidationThreshold: "8000",
                //     liquidationBonus: "11000",
                //     borrowingEnabled: true,
                //     stableBorrowRateEnabled: false,
                //     flashLoanEnabled: true,
                //     reserveDecimals: "18",
                //     aTokenImpl: "AToken",
                //     reserveFactor: "2000",
                //     supplyCap: "1000",
                //     borrowCap: "0",
                //     debtCeiling: "0",
                //     borrowableIsolation: false,
                //     seedAmount: "100000000000000000" //0.1
                // }
            }
        },
        strategyAddresses: { },
        _networkBaseTokenPriceInUsdProxyAggregator: "0xC3346631E0A9720582fB9CAbdBEA22BC2F57741b", //HYPE / USD redstone
        _marketReferenceCurrencyPriceInUsdProxyAggregator: "0xC3346631E0A9720582fB9CAbdBEA22BC2F57741b" //HYPE/USD
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
    deployedContractsChanged();
}

async function saveDeploymentInfo(name, data){
    for (let [key, value] of Object.entries(data)){
        deployedContracts[key] = value;
    }
    deployedContractsChanged()
}

async function deployedContractsChanged(){
    if (!fs.existsSync(path.resolve(__dirname, `./deployments`))) {
        fs.mkdirSync(path.resolve(__dirname, `./deployments`), { recursive: true });
    }

    fs.writeFileSync(path.resolve(__dirname, `./deployments/deployedContracts-${(await makeConfig()).market.SymbolPrefix}.json`), JSON.stringify(deployedContracts, null, 4));
}

async function verify(address, args, libraries){
    if (RUN_VERIFICATION_LIVE){
        await verificationScript.verify(address, args, libraries, {
            verificationDataDir: path.resolve(__dirname, `./verifications/`),
            verificationDataPath: path.resolve(__dirname, `./verifications/${address}.json`)
        })
    } else {
        await verificationScript.storeVerification(address, args, libraries, {
            verificationDataDir: path.resolve(__dirname, `./verifications/`),
            verificationDataPath: path.resolve(__dirname, `./verifications/${address}.json`)
        })
    }
}

module.exports = {
    makeConfig: makeConfig,
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo,
    verify: verify
}