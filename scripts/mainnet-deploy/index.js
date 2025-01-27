const {
    makeConfig,
    getDeployedContractAddress, setDeployedContractAddress,
    saveDeploymentInfo, verify
} = require("./envConfig")

const deployMarketRegistry = require("../deploy/00_core/00_markets_registry")
const deployLogicLibraries = require("../deploy/00_core/01_logic_libraries")

const deployAddressesProvider = require("../deploy/01_pool/00_setup_addresses_provider")
const deployPoolImplementation = require("../deploy/01_pool/01_pool_implementation")
const deployPoolConfigurator = require("../deploy/01_pool/02_pool_configurator")
const initAcl = require("../deploy/01_pool/03_init_acl")
const deployOracle = require("../deploy/01_pool/04_deploy_oracle")
const initPool = require("../deploy/01_pool/05_init_pool")
const deployTokensImplementations = require("../deploy/01_pool/06_tokens_implementations")
const deployRateStrategies = require("../deploy/01_pool/07_rate_strategies")
const initReserves = require("../deploy/01_pool/08_init_reserves")
const configureReserves = require("../deploy/01_pool/09_configure_reserves")

const env = {
    getDeployedContractAddress: getDeployedContractAddress,
    setDeployedContractAddress: setDeployedContractAddress,
    saveDeploymentInfo: saveDeploymentInfo,
    verify: verify
}

deployMarket()

async function deployMarket(){
    console.log(`--------- market deployment started ---------`)
    
    //make deployment config
    env.config = await makeConfig(env)

    //core contracts
    await deployMarketRegistry(env)
    await deployLogicLibraries(env)

    //pool specific contracts
    await deployAddressesProvider(env)
    await deployPoolImplementation(env)
    await deployPoolConfigurator(env)
    await initAcl(env)
    await deployOracle(env)
    await initPool(env)
    await deployTokensImplementations(env)
    await deployRateStrategies(env)
    
    //reserve specific
    await initReserves(env)
    await configureReserves(env)

    console.log(`--------- market deployment completed ---------`)
}