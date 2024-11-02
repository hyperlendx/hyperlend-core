const {
    makeConfig,
    getDeployedContractAddress, setDeployedContractAddress,
    saveDeploymentInfo, verify
} = require("./testEnvConfig")

const deployMockToken = require("../../scripts/deploy/03_misc/deployMockToken")
const deployMockOracleProxy = require("../../scripts/deploy/03_misc/deployMockOracleProxy")

const deployMarketRegistry = require("../../scripts/deploy/00_core/00_markets_registry")
const deployLogicLibraries = require("../../scripts/deploy/00_core/01_logic_libraries")

const deployAddressesProvider = require("../../scripts/deploy/01_pool/00_setup_addresses_provider")
const deployPoolImplementation = require("../../scripts/deploy/01_pool/01_pool_implementation")
const deployPoolConfigurator = require("../../scripts/deploy/01_pool/02_pool_configurator")
const initAcl = require("../../scripts/deploy/01_pool/03_init_acl")
const deployOracle = require("../../scripts/deploy/01_pool/04_deploy_oracle")
const initPool = require("../../scripts/deploy/01_pool/05_init_pool")
const deployTokensImplementations = require("../../scripts/deploy/01_pool/06_tokens_implementations")
const deployRateStrategies = require("../../scripts/deploy/01_pool/07_rate_strategies")
const initReserves = require("../../scripts/deploy/01_pool/08_init_reserves")
const configureReserves = require("../../scripts/deploy/01_pool/09_configure_reserves")

let testEnv = {
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo,
    verify: verify
}

async function setupEnv(){
    console.log(`--------- test environment setup started ---------`)

    //misc contracts
    await deployMockToken(testEnv)
    const mockTokenAddress = getDeployedContractAddress("mockERC20")
    const mockTokenPrice = "100000000" // 1 USD
    await deployMockOracleProxy(testEnv, mockTokenAddress, mockTokenPrice)
    
    //make deployment config
    testEnv.config = await makeConfig(testEnv)

    //core contracts
    await deployMarketRegistry(testEnv)
    await deployLogicLibraries(testEnv)

    //pool specific contracts
    await deployAddressesProvider(testEnv)
    await deployPoolImplementation(testEnv)
    await deployPoolConfigurator(testEnv)
    await initAcl(testEnv)
    await deployOracle(testEnv)
    await initPool(testEnv)
    await deployTokensImplementations(testEnv)
    await deployRateStrategies(testEnv)
    await initReserves(testEnv)
    await configureReserves(testEnv)

    console.log(`--------- test environment setup completed ---------`)
}

async function getContractInstanceById(name){
    let address = testEnv.getDeployedContractAddress(name)
    let contractFactoryType = String(name).charAt(0).toUpperCase() + String(name).slice(1);
    if (!address) return null;

    if (contractFactoryType == "PoolProxy") contractFactoryType = "Pool" //use Pool implementation for proxy address

    let ContractFactory;
    if (contractFactoryType == "Pool"){
        ContractFactory = await ethers.getContractFactory(contractFactoryType, {
            libraries: {
                LiquidationLogic: getDeployedContractAddress("liquidationLogic"),
                SupplyLogic: getDeployedContractAddress("supplyLogic"),
                EModeLogic: getDeployedContractAddress("eModeLogic"),
                FlashLoanLogic: getDeployedContractAddress("flashLoanLogic"),
                BorrowLogic: getDeployedContractAddress("borrowLogic"),
                BridgeLogic: getDeployedContractAddress("bridgeLogic"),
                PoolLogic: getDeployedContractAddress("poolLogic"),
            }
        });
    } else {
        ContractFactory = await ethers.getContractFactory(contractFactoryType);
    }

    return ContractFactory.attach(address);
}

async function getATokenInstance(address){
    let ContractFactory = await ethers.getContractFactory("AToken");
    return ContractFactory.attach(address);
}

function getAvailableContracts(){
    return testEnv.getDeployedContractAddress()
}

module.exports = {
    setupEnv: setupEnv,
    getContractInstanceById: getContractInstanceById,
    getAvailableContracts: getAvailableContracts,
    getATokenInstance: getATokenInstance
}