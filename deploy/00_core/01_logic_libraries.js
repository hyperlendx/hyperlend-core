const { ethers } = require("hardhat");
const path = require('path'); 

const { saveDeploymentInfo } = require("../../markets")

async function main() {
    const SupplyLogic = await ethers.getContractFactory("SupplyLogic");
    const supplyLogic = await SupplyLogic.deploy();
    console.log(`supplyLogic deployed to ${supplyLogic.address}`);

    const BorrowLogic = await ethers.getContractFactory("BorrowLogic");
    const borrowLogic = await BorrowLogic.deploy();
    console.log(`borrowLogic deployed to ${borrowLogic.address}`);

    const LiquidationLogic = await ethers.getContractFactory("LiquidationLogic");
    const liquidationLogic = await LiquidationLogic.deploy();
    console.log(`liquidationLogic deployed to ${liquidationLogic.address}`);

    const EModeLogic = await ethers.getContractFactory("EModeLogic");
    const eModeLogic = await EModeLogic.deploy();
    console.log(`eModeLogic deployed to ${eModeLogic.address}`);

    const BridgeLogic = await ethers.getContractFactory("BridgeLogic");
    const bridgeLogic = await BridgeLogic.deploy();
    console.log(`bridgeLogic deployed to ${bridgeLogic.address}`);

    const ConfiguratorLogic = await ethers.getContractFactory("ConfiguratorLogic");
    const configuratorLogic = await ConfiguratorLogic.deploy();
    console.log(`configuratorLogic deployed to ${configuratorLogic.address}`);

    const FlashLoanLogic = await ethers.getContractFactory("FlashLoanLogic", {
        libraries: {
            BorrowLogic: borrowLogic.address,
        }
    });
    const flashLoanLogic = await FlashLoanLogic.deploy();
    console.log(`flashLoanLogic deployed to ${flashLoanLogic.address}`);

    const PoolLogic = await ethers.getContractFactory("PoolLogic");
    const poolLogic = await PoolLogic.deploy();
    console.log(`poolLogic deployed to ${poolLogic.address}`);

    saveDeploymentInfo(path.basename(__filename), {
        supplyLogic: supplyLogic.address,
        borrowLogic: borrowLogic.address,
        liquidationLogic: liquidationLogic.address,
        bridgeLogic: bridgeLogic.address,
        eModeLogic: eModeLogic.address,
        configuratorLogic: configuratorLogic.address,
        flashLoanLogic: flashLoanLogic.address,
        poolLogic: poolLogic.address
    })
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
