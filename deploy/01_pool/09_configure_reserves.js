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

    //configure reserves
    const ACLManagerArtifact = await ethers.getContractFactory("ACLManager");
    const aclManager = ACLManagerArtifact.attach(await poolAddressesProvider.getACLManager());

    const ReservesSetupHelper = await ethers.getContractFactory("ReservesSetupHelper");
    let reservesSetupHelper;
    if (getDeployedContractAddress("reservesSetupHelper") == null){
        reservesSetupHelper = await ReservesSetupHelper.deploy()
        setDeployedContractAddress("reservesSetupHelper", reservesSetupHelper.address)
        console.log(`reservesSetupHelper deployed to ${reservesSetupHelper.address}`)
    } else {
        reservesSetupHelper = ReservesSetupHelper.attach(getDeployedContractAddress("reservesSetupHelper"));
    }

    const ProtocolDataProvider = await ethers.getContractFactory("ProtocolDataProvider");
    const protocolDataProvider = ProtocolDataProvider.attach(await poolAddressesProvider.getPoolDataProvider())

    const tokens = [];
    const symbols = [];
    const inputParams = []
    const seedAmounts = []

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
                seedAmount
            }
        ] of Object.entries(config.market.ReservesConfig)
    ) {
        if (!config.tokenAddresses[assetSymbol]) {
            console.log(`skipping init of ${assetSymbol} due token address is not set at markets config`);
            continue;
        }
        if (baseLTVAsCollateral === "-1") continue;

        const assetAddressIndex = Object.keys(config.tokenAddresses).findIndex(
            (value) => value === assetSymbol
        );
        const [, tokenAddress] = (Object.entries(config.tokenAddresses))[assetAddressIndex];

        const { usageAsCollateralEnabled: alreadyEnabled } = await protocolDataProvider.getReserveConfigurationData(tokenAddress);
        if (alreadyEnabled) {
            console.log(`reserve ${assetSymbol} is already enabled as collateral, skipping`);
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
        seedAmounts.push(seedAmount)
    }

    console.log(`reservesSetupHelper: ${reservesSetupHelper.address}`)
    console.log(inputParams)
    console.log(`seedAmounts`, seedAmounts)
    let isCorrect = await askForConfirmation()
    if (!isCorrect){
        console.log("Aborting...")
        return;
    }

    //approve seed amounts
    for (let i in seedAmounts){
        if (seedAmounts[i] < 10000) throw new Error("SeedAmountTooLow");
        const MintableERC20 = await ethers.getContractFactory("MintableERC20");
        const erc20Token = MintableERC20.attach(tokens[i]);
        await erc20Token.approve(reservesSetupHelper.address, seedAmounts[i]);
        console.log(`approved ${tokens[i]} for seed amounts`)
    }

    if (tokens.length) {
        // Set aTokenAndRatesDeployer as temporal admin
        await aclManager.addRiskAdmin(reservesSetupHelper.address)

        // Deploy init per chunks
        const enableChunks = 20;
        const chunkedSymbols = chunk(symbols, enableChunks);
        const chunkedInputParams = chunk(inputParams, enableChunks);
        const chunkedSeedAmounts = chunk(seedAmounts, enableChunks)
        const poolConfiguratorAddress = await poolAddressesProvider.getPoolConfigurator();
        console.log(`configure reserves in ${chunkedInputParams.length} txs`);
        
        for (let chunkIndex = 0; chunkIndex < chunkedInputParams.length; chunkIndex++) {
            const tx = await reservesSetupHelper.configureReserves(
                poolConfiguratorAddress,
                chunkedInputParams[chunkIndex],
                chunkedSeedAmounts[chunkIndex],
                (await poolAddressesProvider.getPool())
            )
            
            console.log(
                `init for: ${chunkedSymbols[chunkIndex].join(", ")}`,
                `\ntxHash: ${tx.transactionHash}`
            );
        }

        // Remove ReservesSetupHelper from risk admins
        await aclManager.removeRiskAdmin(reservesSetupHelper.address)
    }

    console.log(`[configured all reserves`);
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
