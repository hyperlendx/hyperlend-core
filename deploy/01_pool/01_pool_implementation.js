const { ethers } = require("hardhat");
const path = require('path'); 

const { saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

const poolAddressesProviderAddress = getDeployedContractAddress("poolAddressesProvider")

async function main() {
    const poolLibraries = await getPoolLibraries()
    for (const [key, value] of Object.entries(poolLibraries)) {
        if (value.length == 0) throw new Error(`missing ${key} library address`)
    }

    const Pool = await ethers.getContractFactory("Pool", {
        libraries: {
            ...poolLibraries,
        }
    });
    const pool = await Pool.deploy(poolAddressesProviderAddress);

    await pool.initialize(poolAddressesProviderAddress)
    console.log(`pool deployed and initialized to ${pool.address}`)

    saveDeploymentInfo(path.basename(__filename), {
        pool: pool.address
    })
}

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
