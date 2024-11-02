const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo, verify } = require("../../markets")

async function main() {
    const networkBaseTokenPriceInUsdProxyAggregator = config.networkBaseTokenPriceInUsdProxyAggregator
    const marketReferenceCurrencyPriceInUsdProxyAggregator = config.marketReferenceCurrencyPriceInUsdProxyAggregator

    const UiPoolDataProviderV3 = await ethers.getContractFactory("UiPoolDataProviderV3");
    const uiPoolDataProviderV3 = await UiPoolDataProviderV3.deploy(networkBaseTokenPriceInUsdProxyAggregator, marketReferenceCurrencyPriceInUsdProxyAggregator);
    console.log(`uiPoolDataProviderV3 deployed to ${uiPoolDataProviderV3.target}`);
    await verify(uiPoolDataProviderV3.target, [networkBaseTokenPriceInUsdProxyAggregator, marketReferenceCurrencyPriceInUsdProxyAggregator])

    const WalletBalanceProvider = await ethers.getContractFactory("WalletBalanceProvider");
    const walletBalanceProvider = await WalletBalanceProvider.deploy();
    console.log(`walletBalanceProvider deployed to ${walletBalanceProvider.target}`);
    await verify(walletBalanceProvider.target, [])

    saveDeploymentInfo(path.basename(__filename), {
        uiPoolDataProviderV3: uiPoolDataProviderV3.target,
        walletBalanceProvider: walletBalanceProvider.target
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
