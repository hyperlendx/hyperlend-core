const { ethers } = require("hardhat");
const path = require('path');
const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const { config, saveDeploymentInfo, getDeployedContractAddress, setDeployedContractAddress } = require("../../markets")

async function main() {
    const PoolAddressesProvider = await ethers.getContractFactory("PoolAddressesProvider");
    const poolAddressesProvider = PoolAddressesProvider.attach(getDeployedContractAddress("poolAddressesProvider"));
    const poolAddress = await poolAddressesProvider.getPool();
    const poolLibraries = await getPoolLibraries()
    const Pool = await ethers.getContractFactory("Pool", {
        libraries: {
            ...poolLibraries,
        }
    }); 
    const pool = Pool.attach(poolAddress)

    // Deploy Reserves
    let initChunks = 4
    let initInputParams = []
    let reserveTokens = [];
    let reserveInitDecimals = [];
    let reserveSymbols = [];

    let strategyAddresses = {};
    let strategyAddressPerAsset = {};
    let aTokenType = {};

    let delegationAwareATokenImplementationAddress = getDeployedContractAddress("delegationAwareAToken");
    let aTokenImplementationAddress = getDeployedContractAddress("aToken");
    let stableDebtTokenImplementationAddress = getDeployedContractAddress("stableDebtToken");
    let variableDebtTokenImplementationAddress = getDeployedContractAddress("variableDebtToken");

    const reserves = Object.entries(config.market.ReservesConfig).filter(
    ([_, { aTokenImpl }]) =>
        aTokenImpl === "DelegationAwareAToken" ||
        aTokenImpl === "AToken"
    );

    for (let [symbol, params] of reserves) {
        const poolReserve = await pool.getReserveData(config.tokenAddresses[symbol]);
        if (poolReserve.aTokenAddress !== config.ZERO_ADDRESS) {
            console.log(`skipping init of ${symbol} due is already initialized`);
            continue;
        }

        const { strategy, aTokenImpl, reserveDecimals } = params;
        if (!config.strategyAddresses[strategy.name]) {
            // Strategy does not exist, load it
            strategyAddresses[strategy.name] = getDeployedContractAddress(strategy.name)
        }
        strategyAddressPerAsset[symbol] = strategyAddresses[strategy.name];
        console.log("strategy address for asset %s: %s", symbol, strategyAddressPerAsset[symbol]);

        if (aTokenImpl === "AToken") {
            aTokenType[symbol] = "generic";
        } else if (aTokenImpl === "DelegationAwareAToken") {
            aTokenType[symbol] = "delegation aware";
        }

        reserveInitDecimals.push(reserveDecimals);
        reserveTokens.push(config.tokenAddresses[symbol]);
        reserveSymbols.push(symbol);
    }

    for (let i = 0; i < reserveSymbols.length; i++) {
        let aTokenToUse;
        if (aTokenType[reserveSymbols[i]] === "generic") {
            aTokenToUse = aTokenImplementationAddress;
        } else {
            aTokenToUse = delegationAwareATokenImplementationAddress;
        }

        //verify underlying asset decimals
        const UnderlyingERC20 = await ethers.getContractFactory("MockERC20");
        const underlyingAsset = UnderlyingERC20.attach(reserveTokens[i]);
        const underlyingSymbol = await underlyingAsset.symbol();
        const underlyingDecimals = await underlyingAsset.decimals();

        if (underlyingSymbol != reserveSymbols[i]) throw new Error(`underlying asset symbol mismatch: ${underlyingSymbol} != ${reserveSymbols[i]}`)
        if (underlyingDecimals != reserveInitDecimals[i]) throw new Error(`underlying decimals mismatch for ${underlyingSymbol}: ${underlyingDecimals} != ${reserveInitDecimals[i]}`)

        initInputParams.push({
            aTokenImpl: aTokenToUse,
            stableDebtTokenImpl: stableDebtTokenImplementationAddress,
            variableDebtTokenImpl: variableDebtTokenImplementationAddress,
            underlyingAssetDecimals: reserveInitDecimals[i],
            interestRateStrategyAddress: strategyAddressPerAsset[reserveSymbols[i]],
            underlyingAsset: reserveTokens[i],
            treasury: config.treasuryAddress,
            incentivesController: config.incentivesController,
            underlyingAssetName: reserveSymbols[i],
            aTokenName: `HyperLend ${config.market.ATokenNamePrefix} ${reserveSymbols[i]}`,
            aTokenSymbol: `h${config.market.SymbolPrefix}${reserveSymbols[i]}`,
            variableDebtTokenName: `HyperLend ${config.market.VariableDebtTokenNamePrefix} Variable Debt ${reserveSymbols[i]}`,
            variableDebtTokenSymbol: `hVariableDebt${config.market.SymbolPrefix}${reserveSymbols[i]}`,
            stableDebtTokenName: `HyperLend ${config.market.StableDebtTokenNamePrefix} Stable Debt ${reserveSymbols[i]}`,
            stableDebtTokenSymbol: `hStableDebt${config.market.SymbolPrefix}${reserveSymbols[i]}`,
            params: "0x10",
        });
    }

    console.log(initInputParams)
    let isCorrect = await askForConfirmation()
    if (!isCorrect){
        console.log("Aborting...")
        return;
    }

    // Deploy init reserves per chunks
    const chunkedSymbols = chunk(reserveSymbols, initChunks);
    const chunkedInitInputParams = chunk(initInputParams, initChunks);

    const PoolConfigurator = await ethers.getContractFactory("PoolConfigurator", {
        libraries: {
            ConfiguratorLogic: getDeployedContractAddress("configuratorLogic")
        }
    });
    const poolConfigurator = PoolConfigurator.attach(await poolAddressesProvider.getPoolConfigurator());

    console.log(`reserves initialization in ${chunkedInitInputParams.length} txs`);
    for (let chunkIndex = 0; chunkIndex < chunkedInitInputParams.length; chunkIndex++) {
        const tx = await poolConfigurator.initReserves(chunkedInitInputParams[chunkIndex])

        console.log(
            `reserve ready for: ${chunkedSymbols[chunkIndex].join(", ")}`,
            `\ntxHash: ${tx.transactionHash}`
        );
    }

    console.log(`initialized all reserves`);
}

function chunk(arr, chunkSize){
    return arr.reduce(
        (prevVal, currVal, currIndx, array) =>
        !(currIndx % chunkSize)
            ? prevVal.concat([array.slice(currIndx, currIndx + chunkSize)])
            : prevVal,
        []
    );
};

async function getPoolLibraries(){
    return {
        LiquidationLogic: getDeployedContractAddress("liquidationLogic"),
        SupplyLogic: getDeployedContractAddress("supplyLogic"),
        EModeLogic: getDeployedContractAddress("eModeLogic"),
        FlashLoanLogic: getDeployedContractAddress("flashLoanLogic"),
        BorrowLogic: getDeployedContractAddress("borrowLogic"),
        BridgeLogic: getDeployedContractAddress("bridgeLogic"),
        PoolLogic: getDeployedContractAddress("poolLogic"),
    };
};

async function askForConfirmation(){
    return new Promise((resolve, reject) => {
        rl.question(`Is this correct [y/n]?`, res => {
            rl.close();
            if (res.toLowerCase() == "y"){
                resolve(true)
            } else {
                resolve(false)
            }
        });
    })
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
