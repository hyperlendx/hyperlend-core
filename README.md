## HyperLend Core contracts

---

Before adding new assets, you MUST check [Asset Listings Checklist](https://github.com/hyperlendx/hyperlend-security/blob/master/checklists/asset-listing.md)

After initial deployment, tokens MUST be added using [Listings Config Engine](https://github.com/hyperlendx/listings-config-engine)

---

HyperLend core code is a fork of [Aave v3.0.2](https://github.com/aave/aave-v3-core), see [diffs](https://gist.github.com/fbslo/ce4d5e6ece9287ce73296c78f5804b6c), generated using [this script](https://github.com/hyperlendx/code-diff-check/)

Changes:
- [ReservesSetupHelper.sol](https://github.com/hyperlendx/hyperlend-core/blob/master/contracts/deployments/ReservesSetupHelper.sol), added seeding on the new pool so new reserves are never empty. This is used only during the initial deployment, for addition asset listings, [ListingsConfigEngine](https://github.com/hyperlendx/listings-config-engine) contract will be used.
- renamed some contract: `AaveOracle` to `Oracle` and `AaveProtocolDataProvider` to `ProtocolDataProvider`
- [StableDebtToken.sol](https://github.com/hyperlendx/hyperlend-core/blob/master/contracts/protocol/tokenization/StableDebtToken.sol#L133) - removed the minting of StableDebt tokens (see [Aave v2/v3 security incident 04/11/2023](https://governance.aave.com/t/aave-v2-v3-security-incident-04-11-2023/15335))
- [FlashLoanLogic.sol](https://github.com/hyperlendx/hyperlend-core/blob/d6bd9cb6ef68a3fb5b63e6737c888f0e3470a444/contracts/protocol/libraries/logic/FlashLoanLogic.sol#L151) - read `maxStableRateBorrowSizePercent`, `reservesCount` and `userEModeCategory` from `Pool` instead of params - [commit](https://github.com/hyperlendx/hyperlend-core/commit/d6bd9cb6ef68a3fb5b63e6737c888f0e3470a444)
- [PriceOracleSentinel.sol](https://github.com/hyperlendx/hyperlend-core/blob/master/contracts/protocol/configuration/PriceOracleSentinel.sol#L72), updated to use `startAt` instead of `lastUpdateTimestamp` - [commit](https://github.com/hyperlendx/hyperlend-core/commit/d6bd9cb6ef68a3fb5b63e6737c888f0e3470a444)

---

### Build & Tests:

This project uses HardHat.

Rename `.env.example` to `.env` and add the private key.

```
npm i
npx hardhat test
```

---

