## HyperLend Core contracts

Run deployments:

```
npx hardhat run deploy/00_core/00_markets_registry.js --network localhost
npx hardhat run deploy/00_core/01_logic_libraries.js --network localhost

npx hardhat run deploy/01_pool/00_setup_addresses_provider.js --network localhost
npx hardhat run deploy/01_pool/01_pool_implementation.js --network localhost
npx hardhat run deploy/01_pool/02_pool_configurator.js --network localhost
npx hardhat run deploy/01_pool/03_init_acl.js --network localhost
npx hardhat run deploy/01_pool/04_deploy_oracles.js --network localhost
npx hardhat run deploy/01_pool/05_init_pool.js --network localhost
npx hardhat run deploy/01_pool/06_tokens_implementations.js --network localhost
npx hardhat run deploy/01_pool/07_init_reserves.js --network localhost
```

NEW MARKETS MUST BE SEEDED WITH SMALL DEPOSIT
TOKENS MUST NOT BE REENTRANT/HAVE HOOKS

---

Arbitrum Sepolia: 

```
poolProxy: 0xAd3AAC48C09f955a8053804D8a272285Dfba4dD2
poolConfiguratorProxy: 0x2B221eeb08491D45b9f4Eb7F2f067ebc864375fA

Tokens:
    USDC: 0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d
    WETH: 0x1dF462e2712496373A347f8ad10802a5E95f053D

PoolAddressesProviderRegistry deployed to 0xF38A8A25DafdCFb5126008ed1f9f2333C3129c93

supplyLogic deployed to 0x22fDFC451e2DDb82d7084D08a50D04f60F2C47C8
borrowLogic deployed to 0x59EA4F0b4Fdda3553E1530a15Ff96dCC126Be8Ce
liquidationLogic deployed to 0x252BEE0B51965Da631d26136775547A3E48550E2
eModeLogic deployed to 0x00a7095e063859D73F6154C945d7F47C42B4A3f2
bridgeLogic deployed to 0x9E72BFA05F9857ab605594aDa74EC0be8bd6Ae81
configuratorLogic deployed to 0xD67A1b90d0906f4A6B0A46A384f9aC4e19acBC86
flashLoanLogic deployed to 0x326CE88B602C954C36864A8F031f5a45936a05eF
poolLogic deployed to 0x49b922C05745B00a93297B1bd71Ade21f8CbDA10

poolAddressesProvider deployed to 0xE65D4B4E740Ad55a04B7dc5Ba2f458215350cc32
protocolDataProvider deployed to 0x714f694f56e9Ca68a149cC06eEe0492606281079

pool deployed and initialized to 0x522050F45889eE78DEea539051b88154717FC3e1

poolConfigurator deployed to 0xC47B090f071c40758CC68afffE448eB523CDe54D
reservesSetupHelper deployed to 0x9566cfCC8C286ef881CC0869E381D24E8A3877f2

priceOracle deployed to 0x06F7e3E10A3c140ff7e857A9C9fFAC4393456001

HToken deployed to 0xaA5199c2cC7af47d3232fE1814EBE8429c3B6858
delegationAwareHToken deployed to 0xC70e2E575c9F41338CeC9B28a0e85986Fa8e9eDF
stableDebtToken deployed to 0x453b63484b11bbF0b61fC7E854f8DAC7bdE7d458
variableDebtToken deployed to 0x53212125DE244C1D737f145Ee0947Fd589B66Cf6

rateStrategyVolatileOne deployed to 0x52988EddD859b142b8AfbC3525852DE2B1b93F01
```