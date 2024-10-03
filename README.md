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
npx hardhat run deploy/01_pool/07_rate_strategies.js --network localhost
npx hardhat run deploy/01_pool/08_init_reserves.js --network localhost
npx hardhat run deploy/01_pool/09_configure_reserves.js --network localhost

npx hardhat run deploy/02_periphery/00_ui_helpers.js --network localhost
npx hardhat run deploy/02_periphery/01_wrapped_token_gateway.js --network localhost
```

---

HyperEVM testnet:


- Deployer: 0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D
- /
- mockUSDC: 0xA8dC952187FAedA6C47F74586886507Da1C6F1f6
- mockBTC: 0x453b63484b11bbF0b61fC7E854f8DAC7bdE7d458
- mockETH: 0xBa331f80306b55318b788A0cC6025DE389b4f07B
- /
- PoolAddressesProviderRegistry: 0xF38A8A25DafdCFb5126008ed1f9f2333C3129c93
- /
- SupplyLogic: 0x22fDFC451e2DDb82d7084D08a50D04f60F2C47C8
- BorrowLogic: 0x59EA4F0b4Fdda3553E1530a15Ff96dCC126Be8Ce
- LiquidationLogic: 0x252BEE0B51965Da631d26136775547A3E48550E2
- EModeLogic: 0x00a7095e063859D73F6154C945d7F47C42B4A3f2
- BridgeLogic: 0x9E72BFA05F9857ab605594aDa74EC0be8bd6Ae81
- ConfiguratorLogic: 0xD67A1b90d0906f4A6B0A46A384f9aC4e19acBC86
- FlashLoanLogic: 0x326CE88B602C954C36864A8F031f5a45936a05eF
- PoolLogic: 0x49b922C05745B00a93297B1bd71Ade21f8CbDA10
- /
- HyperEvmOracleAggregator: 0x824A4309686C74C3369Ab2273A6f2ced629422e2
- purrProvider: /
- mockUsdcProvider: / 
- mockEthProvider: 0x8fD6C8f776AfEB29237Be490DC39d0b2162c42B5 (not added to Oracle yet)
- mockBtcProvider: 0x3437aE65ae0C2b80437E55c829fF6C895Eee061c
- /
- PoolAddressesProvider: 0xa1d0ca19d6877cE4Bf51496305393aa28607012d
- ProtocolDataProvider: 0x4b23ceb59670108A569Bb69eC35386449d77C815
- /
- Pool (impl): 0x06F7e3E10A3c140ff7e857A9C9fFAC4393456001
- /
- PoolConfigurator: 0x8033AD4F1613253566aD11C66A51eF09Ac8166Cf
- ReservesSetupHelper: 0x9B8cc93e32339824D6e3C6e0794B757d647fd15a
- /
- ACLManager: 0x52988EddD859b142b8AfbC3525852DE2B1b93F01
- /
- Oracle: 0xecbD8482C698B7b2706807A32d7FDf4E9a55C6A1
- /
- Pool (proxy): 0x1e85CCDf0D098a9f55b82F3E35013Eda235C8BD8
- PoolConfigurator (proxy): 0x99CCC54fF811D51887718C3D58B814d2A910A258
- /
- HToken (implementation): 0x7d028b7b61eA887FC942f1b5cb8245d6f1189582
- DelegationAwareHToken: 0x2b363bf83d24f7D36aa75C05C79CaD0538046cfF
- StableDebtToken: 0x0a78cBB3123782AD75F8fA1faB566bA7eba76fd5
- VariableDebtToken: 0xF997DeA692C2D93359828321C5B711B791bBd46A
- /
- rateStrategyVolatileOne: 0xFf377dbB97c674Bfa201d8CdcAe597D1231317Ea
- rateStrategyStableOne: 0xAEd164046AFB672EdD2350C974355d93a06142ad
- /
- mockBTC: 0x453b63484b11bbF0b61fC7E854f8DAC7bdE7d458
- hMBTC: 0xde72990638db12f8AA4cd9406bA6c648153A5cEA
- Variable Debt MBTC: 0x742d75d7389E66f6C17898A0e19077E17F1C51d1
- /
- UiPoolDataProviderV3: 0x3B3E98B61AFB357b1AA7Ff8BD83BE5516906c659
- WalletBalanceProvider: 0x99c06000a9c3311E8A46326332e6280Ca5029284

---

Arbitrum Mainnet:


- Deployer: 0x16703F774Bd7b2F2E6f39E7dCead924fa2080a0D
- /
- PoolAddressesProviderRegistry: [0xF38A8A25DafdCFb5126008ed1f9f2333C3129c93](https://arbiscan.io/address/0xF38A8A25DafdCFb5126008ed1f9f2333C3129c93)
- /
- SupplyLogic: [0x22fDFC451e2DDb82d7084D08a50D04f60F2C47C8](https://arbiscan.io/address/0x22fDFC451e2DDb82d7084D08a50D04f60F2C47C8)
- BorrowLogic: [0x59EA4F0b4Fdda3553E1530a15Ff96dCC126Be8Ce](https://arbiscan.io/address/0x59EA4F0b4Fdda3553E1530a15Ff96dCC126Be8Ce)
- LiquidationLogic: [0x252BEE0B51965Da631d26136775547A3E48550E2](https://arbiscan.io/address/0x252BEE0B51965Da631d26136775547A3E48550E2)
- EModeLogic: [0x00a7095e063859D73F6154C945d7F47C42B4A3f2](https://arbiscan.io/address/0x00a7095e063859D73F6154C945d7F47C42B4A3f2)
- BridgeLogic: [0x9E72BFA05F9857ab605594aDa74EC0be8bd6Ae81](https://arbiscan.io/address/0x9E72BFA05F9857ab605594aDa74EC0be8bd6Ae81)
- ConfiguratorLogic: [0xD67A1b90d0906f4A6B0A46A384f9aC4e19acBC86](https://arbiscan.io/address/0xD67A1b90d0906f4A6B0A46A384f9aC4e19acBC86)
- FlashLoanLogic: [0x326CE88B602C954C36864A8F031f5a45936a05eF](https://arbiscan.io/address/0x326CE88B602C954C36864A8F031f5a45936a05eF)
- PoolLogic: [0x49b922C05745B00a93297B1bd71Ade21f8CbDA10](https://arbiscan.io/address/0x49b922C05745B00a93297B1bd71Ade21f8CbDA10)
- /
- PoolAddressesProvider: [0xE65D4B4E740Ad55a04B7dc5Ba2f458215350cc32](https://arbiscan.io/address/0xE65D4B4E740Ad55a04B7dc5Ba2f458215350cc32)
- ProtocolDataProvider: [0x824A4309686C74C3369Ab2273A6f2ced629422e2](https://arbiscan.io/address/0x824A4309686C74C3369Ab2273A6f2ced629422e2)
- /
- Pool (impl): [0x0A1650c5b7349D31B54bE510081a3eeFB7CFF119](https://arbiscan.io/address/0x0A1650c5b7349D31B54bE510081a3eeFB7CFF119)
- /
- PoolConfigurator: [0x9566cfCC8C286ef881CC0869E381D24E8A3877f2](https://arbiscan.io/address/0x9566cfCC8C286ef881CC0869E381D24E8A3877f2)
- ReservesSetupHelper: [0x016af22B7Bc1930ecE1B09919FB1ec7657f0e456](https://arbiscan.io/address/0x016af22B7Bc1930ecE1B09919FB1ec7657f0e456)
- /
- ACLManager: [0x4b23ceb59670108A569Bb69eC35386449d77C815](https://arbiscan.io/address/0x4b23ceb59670108A569Bb69eC35386449d77C815)
- /
- Oracle: [0x8033AD4F1613253566aD11C66A51eF09Ac8166Cf](https://arbiscan.io/address/0x8033AD4F1613253566aD11C66A51eF09Ac8166Cf)
- /
- Pool (proxy): [0xAd3AAC48C09f955a8053804D8a272285Dfba4dD2](https://arbiscan.io/address/0xAd3AAC48C09f955a8053804D8a272285Dfba4dD2)
- PoolConfigurator (proxy): [0x2B221eeb08491D45b9f4Eb7F2f067ebc864375fA](https://arbiscan.io/address/0x2B221eeb08491D45b9f4Eb7F2f067ebc864375fA)
- /
- HToken (implementation): [0xa0d5B18264F1Ec7a204e1B0688620e4d50a4B8c1](https://arbiscan.io/address/0xa0d5B18264F1Ec7a204e1B0688620e4d50a4B8c1)
- DelegationAwareHToken: [0xecbD8482C698B7b2706807A32d7FDf4E9a55C6A1](https://arbiscan.io/address/0xecbD8482C698B7b2706807A32d7FDf4E9a55C6A1)
- StableDebtToken: [0x7598447F0b39c4a3503e3D2676A7E0509E535372](https://arbiscan.io/address/0x7598447F0b39c4a3503e3D2676A7E0509E535372)
- VariableDebtToken: [0x619dbb0B6A0726356444213E96130217E0e14e53](https://arbiscan.io/address/0x619dbb0B6A0726356444213E96130217E0e14e53)
- /
- rateStrategyVolatileOne: [0x7d028b7b61eA887FC942f1b5cb8245d6f1189582](https://arbiscan.io/address/0x7d028b7b61eA887FC942f1b5cb8245d6f1189582)
- rateStrategyStableOne: [0xa18DE0E9fd605be95026130FDFb592431Fc7a9B7](https://arbiscan.io/address/0xa18de0e9fd605be95026130fdfb592431fc7a9b7)
- /
- ReservesSetupHelper: [0x7d04534cb84789f4DCf9F59b7ff06d642cCaffa4](https://arbiscan.io/address/0x7d04534cb84789f4DCf9F59b7ff06d642cCaffa4)
- /
- USDC: [0xaf88d065e77c8cC2239327C5EDb3A432268e5831](https://arbiscan.io/address/0xaf88d065e77c8cC2239327C5EDb3A432268e5831)
- hUSDC: [0x4ed318353e3aB859F614aB41BFC33f98Cca8B3aE](https://arbiscan.io/address/0x4ed318353e3ab859f614ab41bfc33f98cca8b3ae)
- Stable Debt USDC (deprecated): [0x6a970b349D8B60b57a335C0bdd16b8EEbD19Fa8F](https://arbiscan.io/address/0x6a970b349D8B60b57a335C0bdd16b8EEbD19Fa8F)
- Variable Debt USDC: [0x82bf3C188d6397f2b9dE6D9F3834381C9C205585](https://arbiscan.io/address/0x82bf3C188d6397f2b9dE6D9F3834381C9C205585)
- /
- WETH: [0x82aF49447D8a07e3bd95BD0d56f35241523fBab1](https://arbiscan.io/address/0x82aF49447D8a07e3bd95BD0d56f35241523fBab1)
- hWETH: [0xf03cec3e8167bb661aceb2fbe1076161ad2a1b14](https://arbiscan.io/address/0xf03cec3e8167bb661aceb2fbe1076161ad2a1b14)
- Stable Debt WETH (deprecated): [0xf6fc13805d62477e3ab5bcde4290f45d29c98fb4](https://arbiscan.io/address/0xf6fc13805d62477e3ab5bcde4290f45d29c98fb4)
- Variable Debt WETH: [0xa0138da10498a77e6b798107cbcabca54e9ab729](https://arbiscan.io/address/0xa0138da10498a77e6b798107cbcabca54e9ab729)
- /
- WBTC: [0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f](https://arbiscan.io/address/0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f)
- hWBTC: [0x1acbf79a74ec29df4dcaf70663e6252966fba6a9](https://arbiscan.io/address/0x1acbf79a74ec29df4dcaf70663e6252966fba6a9)
- Stable Debt WBTC (deprecated): [0xa0BB90E88dCD726Dc562e9d4B87E0123b0285498](https://arbiscan.io/address/0xa0BB90E88dCD726Dc562e9d4B87E0123b0285498)
- Variable Debt WBTC: [0x33A2D49B3AdB11569110cDaE9ad085ebc5faC7e6](https://arbiscan.io/address/0x33A2D49B3AdB11569110cDaE9ad085ebc5faC7e6)
- /
- USDT: [0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9](https://arbiscan.io/address/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9)
- hUSDT: [0x90062a80148a9f368d6e40bfeb125dcf1daff5ab](https://arbiscan.io/address/0x90062a80148a9f368d6e40bfeb125dcf1daff5ab)
- Stable Debt USDT (deprecated): [0xab61b66cB6eDa6fCD3C79B2c756dF1863E08d0f0](https://arbiscan.io/address/0xab61b66cB6eDa6fCD3C79B2c756dF1863E08d0f0)
- Variable Debt USDT: [0xB5a36b6C87b9bdC093D005ca307381e9A1e09BAb](https://arbiscan.io/address/0xB5a36b6C87b9bdC093D005ca307381e9A1e09BAb)
- /
- UiPoolDataProviderV3: [0x0b3bF4D76C035E1CcedE18F9195De98c41c5dDf0](https://arbiscan.io/address/0x0b3bF4D76C035E1CcedE18F9195De98c41c5dDf0)
- WalletBalanceProvider: [0xc159A250D1aF83daB32d202a6f1F65fEbA7981f5](https://arbiscan.io/address/0xc159A250D1aF83daB32d202a6f1F65fEbA7981f5)


| Coin    | LTV | Liquidation Threshold | Supply Cap | Borrow Cap | Liquidation Bonus | Liquidation Protocol Fee | Reserve Factor |
| -------- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| USDC | 80%  | 85% | 10,000  | N/A | 10% | 20% | 20%
| WETH | 75%  | 80% | 5       | N/A | 10% | 20% | 20%
| WBTC | 75%  | 80% | 1       | N/A | 10% | 20% | 20%
| USDT | 80%  | 85% | 10,000  | N/A | 10% | 20% | 20%
