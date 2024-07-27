const { ethers } = require("hardhat");
const hre = require("hardhat")
const fs = require("fs")
const path = require('path'); 

const { config, saveDeploymentInfo, getDeployedContractAddress } = require("../../markets")

const poolAddressesProvider = getDeployedContractAddress("poolAddressesProvider")

async function main() {
    const poolLibraries = await getPoolLibraries()

    const Pool = await ethers.getContractFactory("Pool", {
        libraries: {
            ...poolLibraries,
        }
    });
    const pool = await Pool.deploy(poolAddressesProvider);

    await pool.initialize(poolAddressesProvider)
    console.log(`pool deployed and initialized to ${pool.address}`)

    saveDeploymentInfo(path.basename(__filename), {
        pool: pool.address
    })
}

async function getPoolLibraries(){
    // const logicAddresses = JSON.parse(fs.readFileSync("./deployments/01_logic_libraries.json", "utf-8"))

    // const SupplyLogic = await ethers.getContractFactory("SupplyLogic");
    // const supplyLogic = SupplyLogic.attach(logicAddresses.supplyLogic);

    // const BorrowLogic = await ethers.getContractFactory("BorrowLogic");
    // const borrowLogic = BorrowLogic.attach(logicAddresses.borrowLogic);

    // const LiquidationLogic = await ethers.getContractFactory("LiquidationLogic");
    // const liquidationLogic = LiquidationLogic.attach(logicAddresses.liquidationLogic);

    // const EModeLogic = await ethers.getContractFactory("EModeLogic");
    // const eModeLogic = EModeLogic.attach(logicAddresses.eModeLogic);

    // const BridgeLogic = await ethers.getContractFactory("BridgeLogic");
    // const bridgeLogic = BridgeLogic.attach(logicAddresses.bridgeLogic);

    // const ConfiguratorLogic = await ethers.getContractFactory("ConfiguratorLogic");
    // const configuratorLogic = ConfiguratorLogic.attach(logicAddresses.configuratorLogic);

    // const FlashLoanLogic = await ethers.getContractFactory("FlashLoanLogic", { libraries: { BorrowLogic: borrowLogic.address } });
    // const flashLoanLogic = FlashLoanLogic.attach(logicAddresses.flashLoanLogic);

    // const PoolLogic = await ethers.getContractFactory("PoolLogic");
    // const poolLogic = PoolLogic.attach(logicAddresses.poolLogic);

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
