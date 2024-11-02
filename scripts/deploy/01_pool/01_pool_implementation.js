const { ethers } = require("hardhat");
const path = require('path'); 

async function main({ config, saveDeploymentInfo, getDeployedContractAddress, verify }) {
    const poolLibraries = await getPoolLibraries(getDeployedContractAddress)
    for (const [key, value] of Object.entries(poolLibraries)) {
        if (value.length == 0) throw new Error(`missing ${key} library address`)
    }

    const poolAddressesProviderAddress = getDeployedContractAddress("poolAddressesProvider")
    const Pool = await ethers.getContractFactory("Pool", {
        libraries: {
            ...poolLibraries,
        }
    });
    const pool = await Pool.deploy(poolAddressesProviderAddress);

    await pool.initialize(poolAddressesProviderAddress)
    console.log(`pool implementation deployed and initialized to ${pool.target}`)
    await verify(pool.target, [poolAddressesProviderAddress], {
        ...poolLibraries,
    })

    saveDeploymentInfo(path.basename(__filename), {
        pool: pool.target
    })
}

async function getPoolLibraries(getDeployedContractAddress){
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

module.exports = main