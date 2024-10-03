const { ethers } = require("hardhat");
const fs = require("fs")
const path = require('path');

const { config, saveDeploymentInfo } = require("../../markets")

async function main() {
    const _networkBaseTokenPriceInUsdProxyAggregator =  "0x8fD6C8f776AfEB29237Be490DC39d0b2162c42B5"//"0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612" //ETH / USD chainlink
    const _marketReferenceCurrencyPriceInUsdProxyAggregator = "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612" //ETH/USD

    const UiPoolDataProviderV3 = await ethers.getContractFactory("UiPoolDataProviderV3");
    const uiPoolDataProviderV3 = await UiPoolDataProviderV3.deploy(_networkBaseTokenPriceInUsdProxyAggregator, _marketReferenceCurrencyPriceInUsdProxyAggregator);
    console.log(`uiPoolDataProviderV3 deployed to ${uiPoolDataProviderV3.address}`);

    const WalletBalanceProvider = await ethers.getContractFactory("WalletBalanceProvider");
    const walletBalanceProvider = await WalletBalanceProvider.deploy();
    console.log(`walletBalanceProvider deployed to ${walletBalanceProvider.address}`);

    saveDeploymentInfo(path.basename(__filename), {
        uiPoolDataProviderV3: uiPoolDataProviderV3.address,
        walletBalanceProvider: walletBalanceProvider.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
