const { ethers } = require("hardhat");
const path = require('path');

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
        deployedIRStrategies.push(defaultReserveInterestRateStrategy.address)
        setDeployedContractAddress(strategyData.name, defaultReserveInterestRateStrategy.address)
    }

    // Deploy Reserves
    let initChunks = 3
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
            console.log(`- Skipping init of ${symbol} due is already initialized`);
            continue;
        }
        const { strategy, aTokenImpl, reserveDecimals } = params;
        if (!config.strategyAddresses[strategy.name]) {
            // Strategy does not exist, load it
            strategyAddresses[strategy.name] = getDeployedContractAddress(strategy.name)
        }
        strategyAddressPerAsset[symbol] = strategyAddresses[strategy.name];
        console.log("Strategy address for asset %s: %s", symbol, strategyAddressPerAsset[symbol]);

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
            aTokenName: `Hyperlend ${config.market.ATokenNamePrefix} ${reserveSymbols[i]}`,
            aTokenSymbol: `h${config.market.SymbolPrefix}${reserveSymbols[i]}`,
            variableDebtTokenName: `Hyperlend ${config.market.VariableDebtTokenNamePrefix} Variable Debt ${reserveSymbols[i]}`,
            variableDebtTokenSymbol: `variableDebt${config.market.SymbolPrefix}${reserveSymbols[i]}`,
            stableDebtTokenName: `Hyperlend ${config.market.StableDebtTokenNamePrefix} Stable Debt ${reserveSymbols[i]}`,
            stableDebtTokenSymbol: `stableDebt${config.market.SymbolPrefix}${reserveSymbols[i]}`,
            params: "0x10",
        });
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

    console.log(`- Reserves initialization in ${chunkedInitInputParams.length} txs`);
    for (let chunkIndex = 0; chunkIndex < chunkedInitInputParams.length; chunkIndex++) {
        const tx = await poolConfigurator.initReserves(chunkedInitInputParams[chunkIndex])

        console.log(
            `  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(", ")}`,
            `\n    - Tx hash: ${tx.transactionHash}`
        );
    }

    //configure reserves
    const ACLManagerArtifact = await ethers.getContractFactory("ACLManager");
    const aclManager = ACLManagerArtifact.attach(await poolAddressesProvider.getACLManager());

    const ReservesSetupHelper = await ethers.getContractFactory("ReservesSetupHelper");
    const reservesSetupHelper = await ReservesSetupHelper.deploy()
    console.log(`reservesSetupHelper deployed to ${reservesSetupHelper.address}`)

    const AaveProtocolDataProvider = await ethers.getContractFactory("AaveProtocolDataProvider");
    const protocolDataProvider = AaveProtocolDataProvider.attach(await poolAddressesProvider.getPoolDataProvider())

    const tokens = [];
    const symbols = [];
    const inputParams = []

    for (
        const [
            assetSymbol, 
            {
                baseLTVAsCollateral,
                liquidationBonus,
                liquidationThreshold,
                reserveFactor,
                borrowCap,
                supplyCap,
                stableBorrowRateEnabled,
                borrowingEnabled,
                flashLoanEnabled,
            }
        ] of Object.entries(config.market.ReservesConfig)
    ) {
        if (!config.tokenAddresses[assetSymbol]) {
            console.log(`- Skipping init of ${assetSymbol} due token address is not set at markets config`);
            continue;
        }
        if (baseLTVAsCollateral === "-1") continue;

        const assetAddressIndex = Object.keys(config.tokenAddresses).findIndex(
            (value) => value === assetSymbol
        );
        const [, tokenAddress] = (Object.entries(config.tokenAddresses))[assetAddressIndex];

        const { usageAsCollateralEnabled: alreadyEnabled } = await protocolDataProvider.getReserveConfigurationData(tokenAddress);
        if (alreadyEnabled) {
            console.log(`- Reserve ${assetSymbol} is already enabled as collateral, skipping`);
            continue;
        }

        inputParams.push({
            asset: tokenAddress,
            baseLTV: baseLTVAsCollateral,
            liquidationThreshold,
            liquidationBonus,
            reserveFactor,
            borrowCap,
            supplyCap,
            stableBorrowingEnabled: stableBorrowRateEnabled,
            borrowingEnabled: borrowingEnabled,
            flashLoanEnabled: flashLoanEnabled,
        });
    
        tokens.push(tokenAddress);
        symbols.push(assetSymbol);
    }

    if (tokens.length) {
        // Set aTokenAndRatesDeployer as temporal admin
        await aclManager.addRiskAdmin(reservesSetupHelper.address)

        // Deploy init per chunks
        const enableChunks = 20;
        const chunkedSymbols = chunk(symbols, enableChunks);
        const chunkedInputParams = chunk(inputParams, enableChunks);
        const poolConfiguratorAddress = await poolAddressesProvider.getPoolConfigurator();
        console.log(`- Configure reserves in ${chunkedInputParams.length} txs`);
        
        for (let chunkIndex = 0; chunkIndex < chunkedInputParams.length; chunkIndex++) {
            const tx = await reservesSetupHelper.configureReserves(
                poolConfiguratorAddress,
                chunkedInputParams[chunkIndex]
            )
            
            console.log(
                `  - Init for: ${chunkedSymbols[chunkIndex].join(", ")}`,
                `\n- Tx hash: ${tx.transactionHash}`
            );
        }

        // Remove ReservesSetupHelper from risk admins
        await aclManager.removeRiskAdmin(reservesSetupHelper.address)
    }

    saveDeploymentInfo(path.basename(__filename), {
        defaultReserveInterestRateStrategy: deployedIRStrategies,
        reservesSetupHelper: reservesSetupHelper.address,
        protocolDataProvider: protocolDataProvider.address
    })  

    console.log(`[Deployment] Configured all reserves`);
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


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
