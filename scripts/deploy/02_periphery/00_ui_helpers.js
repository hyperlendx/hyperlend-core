const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo, verify } = require("../../markets")

async function main() {
    const networkBaseTokenPriceInUsdProxyAggregator = config.networkBaseTokenPriceInUsdProxyAggregator
    const marketReferenceCurrencyPriceInUsdProxyAggregator = config.marketReferenceCurrencyPriceInUsdProxyAggregator

    const UiPoolDataProviderV3 = await ethers.getContractFactory("UiPoolDataProviderV3");
    const uiPoolDataProviderV3 = await UiPoolDataProviderV3.deploy(networkBaseTokenPriceInUsdProxyAggregator, marketReferenceCurrencyPriceInUsdProxyAggregator);
    console.log(`uiPoolDataProviderV3 deployed to ${uiPoolDataProviderV3.address}`);
    await verify(uiPoolDataProviderV3.address, [networkBaseTokenPriceInUsdProxyAggregator, marketReferenceCurrencyPriceInUsdProxyAggregator])

    const WalletBalanceProvider = await ethers.getContractFactory("WalletBalanceProvider");
    const walletBalanceProvider = await WalletBalanceProvider.deploy();
    console.log(`walletBalanceProvider deployed to ${walletBalanceProvider.address}`);
    await verify(walletBalanceProvider.address, [])

    saveDeploymentInfo(path.basename(__filename), {
        uiPoolDataProviderV3: uiPoolDataProviderV3.address,
        walletBalanceProvider: walletBalanceProvider.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
