# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js
```

---

Run deployments:

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

