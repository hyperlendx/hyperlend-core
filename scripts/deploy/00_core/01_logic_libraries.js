const { ethers } = require("hardhat");
const path = require('path'); 

async function main({ config, saveDeploymentInfo, verify }) {
    const SupplyLogic = await ethers.getContractFactory("SupplyLogic");
    const supplyLogic = await SupplyLogic.deploy();
    console.log(`supplyLogic deployed to ${supplyLogic.target}`);
    await verify(supplyLogic.target, [])

    const BorrowLogic = await ethers.getContractFactory("BorrowLogic");
    const borrowLogic = await BorrowLogic.deploy();
    console.log(`borrowLogic deployed to ${borrowLogic.target}`);
    await verify(borrowLogic.target, [])

    const LiquidationLogic = await ethers.getContractFactory("LiquidationLogic");
    const liquidationLogic = await LiquidationLogic.deploy();
    console.log(`liquidationLogic deployed to ${liquidationLogic.target}`);
    await verify(liquidationLogic.target, [])

    const EModeLogic = await ethers.getContractFactory("EModeLogic");
    const eModeLogic = await EModeLogic.deploy();
    console.log(`eModeLogic deployed to ${eModeLogic.target}`);
    await verify(eModeLogic.target, [])

    const BridgeLogic = await ethers.getContractFactory("BridgeLogic");
    const bridgeLogic = await BridgeLogic.deploy();
    console.log(`bridgeLogic deployed to ${bridgeLogic.target}`);
    await verify(bridgeLogic.target, [])

    const ConfiguratorLogic = await ethers.getContractFactory("ConfiguratorLogic");
    const configuratorLogic = await ConfiguratorLogic.deploy();
    console.log(`configuratorLogic deployed to ${configuratorLogic.target}`);
    await verify(configuratorLogic.target, [])

    const FlashLoanLogic = await ethers.getContractFactory("FlashLoanLogic", {
        libraries: {
            BorrowLogic: borrowLogic.target,
        }
    });
    const flashLoanLogic = await FlashLoanLogic.deploy();
    console.log(`flashLoanLogic deployed to ${flashLoanLogic.target}`);
    await verify(flashLoanLogic.target, [], {
        BorrowLogic: borrowLogic.target,
    })

    const PoolLogic = await ethers.getContractFactory("PoolLogic");
    const poolLogic = await PoolLogic.deploy();
    console.log(`poolLogic deployed to ${poolLogic.target}`);
    await verify(poolLogic.target, [])

    saveDeploymentInfo(path.basename(__filename), {
        supplyLogic: supplyLogic.target,
        borrowLogic: borrowLogic.target,
        liquidationLogic: liquidationLogic.target,
        bridgeLogic: bridgeLogic.target,
        eModeLogic: eModeLogic.target,
        configuratorLogic: configuratorLogic.target,
        flashLoanLogic: flashLoanLogic.target,
        poolLogic: poolLogic.target
    })
}

module.exports = main
