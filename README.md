## HyperLend Core contracts

---

Before adding new assets, you MUST check https://github.com/hyperlendx/hyperlend-security/

After initial deployment, tokens MUST be added using [Listings Config Engine](https://github.com/hyperlendx/listings-config-engine)

---

HyperLend core code is a fork of [Aave v3.0.2](https://github.com/aave/aave-v3-core), see [diffs](https://gist.github.com/fbslo/ce4d5e6ece9287ce73296c78f5804b6c), generated using [this script](https://github.com/hyperlendx/code-diff-check/)

---

Ddeployment scripts:

```
npx hardhat run scripts/deploy/00_core/00_markets_registry.js --network localhost
npx hardhat run scripts/deploy/00_core/01_logic_libraries.js --network localhost

npx hardhat run scripts/deploy/01_pool/00_setup_addresses_provider.js --network localhost
npx hardhat run scripts/deploy/01_pool/01_pool_implementation.js --network localhost
npx hardhat run scripts/deploy/01_pool/02_pool_configurator.js --network localhost
npx hardhat run scripts/deploy/01_pool/03_init_acl.js --network localhost
npx hardhat run scripts/deploy/01_pool/04_deploy_oracles.js --network localhost
npx hardhat run scripts/deploy/01_pool/05_init_pool.js --network localhost
npx hardhat run scripts/deploy/01_pool/06_tokens_implementations.js --network localhost
npx hardhat run scripts/deploy/01_pool/07_rate_strategies.js --network localhost
npx hardhat run scripts/deploy/01_pool/08_init_reserves.js --network localhost
npx hardhat run scripts/deploy/01_pool/09_configure_reserves.js --network localhost

npx hardhat run scripts/deploy/02_periphery/00_ui_helpers.js --network localhost
npx hardhat run scripts/deploy/02_periphery/01_wrapped_token_gateway.js --network localhost
```

---
