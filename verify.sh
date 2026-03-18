#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
RPC_URL="${RPC_URL:-https://rpc.hyperliquid.xyz/evm}"
ETHERSCAN_API_KEY="${ETHERSCAN_API_KEY:-YOUR_API_KEY_HERE}"

# Optional: override with --rpc and/or --key flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --rpc) RPC_URL="$2"; shift 2 ;;
    --key) ETHERSCAN_API_KEY="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ "$ETHERSCAN_API_KEY" == "YOUR_API_KEY_HERE" ]]; then
  echo "Tip: export ETHERSCAN_API_KEY=xxxx or pass --key xxxx"
fi

verify() {
  local address="$1"
  local contract="$2"
  echo "Verifying $contract at $address"
  forge verify-contract \
    --verifier etherscan \
    --rpc-url "$RPC_URL" \
    "$address" "$contract" \
    --watch \
    --etherscan-api-key "$ETHERSCAN_API_KEY"
}

## --- Logic libraries (Aave v3 core: contracts/protocol/libraries/logic) ---
#verify 0x4c52FE2162200bf26c314d7bbd8611699139d553 BorrowLogic
#verify 0x97dCbFaE5372A63128F141E8C0BC2c871Ca5F604 BridgeLogic
#verify 0x3a593A622754ed9572599D33Aad6D799B0899Fae ConfiguratorLogic
#verify 0x88F864670De467aA73CD45325F9652C578C8AB85 EModeLogic
#verify 0xb32381feFFF45eE9F47fD2f2cF83C832637d6EF0 FlashLoanLogic
#verify 0x80d16970B31243Fe67DaB028115f3E4c3E3510Ad LiquidationLogic
#verify 0xA58FB47bE9074828215A173564C0CD10f6F249bf PoolLogic
#verify 0x2b22E425C1322fbA0DbF17bb1dA25d71811EE7ba SupplyLogic

# --- Config Engine (Aave v3.2 Config Engine) ---
#verify 0x12CED8E5B949a51Cd6F181D2cBF731F8B6172af9 BorrowEngine
#verify 0x640C0066EeE6C428fF04C130FD4b9A3AA28258C9 CapsEngine
#verify 0xbD30cE704D2ABf8C5ebf02ea07aCBbB9EA36c4e1 CollateralEngine
#verify 0xEAa46DeF4b7F9404fE6f8E0e05ACDAadAd1EcD96 ListingEngine
#verify 0x7F8c06dd5143b837B7D86be6f55876C608c0301c PriceFeedEngine
#verify 0x3e5F62265793a28bBdb0CF71CC04b18633461873 RateEngine
#verify 0xb12FF1Ad94a1fe3f185d5F1AB9e8c4Ded6aDDf01 EModeEngine

# --- Core protocol contracts ---
#verify 0x72c98246a98bFe64022a3190e7710E157497170C PoolAddressesProvider
#verify 0x24E301BcBa5C098B3b41eA61a52bFe95Cb728b20 PoolAddressesProviderRegistry
#verify 0x10914Ee2C2dd3F3dEF9EFFB75906CA067700a04A ACLManager
#verify 0xC9Fb4fbE842d57EAc1dF3e641a281827493A630e AaveOracle
#verify 0x5481bf8d3946E6A3168640c1D7523eB59F055a29 AaveProtocolDataProvider

# Pool & Configurator implementations (logic contracts)
#verify 0xc19d68383Ed7AB130c15cEad839e67A7Ed9d7041 Pool
#verify 0xdc1f036389fc0Ad122D96893576C1C6434215eAB PoolConfiguratorInstance

# Proxies (OpenZeppelin TransparentUpgradeableProxy)
# If your explorer requires full name with path, use: "TransparentUpgradeableProxy"
#verify 0x00A89d7a5A02160f20150EbEA7a2b5E4879A1A8b TransparentUpgradeableProxy   # PoolProxy
#verify 0x8CB4310dD38F6fD59388C9DE225f328092bdC379 TransparentUpgradeableProxy   # PoolConfiguratorProxy
#verify 0x2aF0d6754A58723c50b5e73E45D964bFDD99fE2F TransparentUpgradeableProxy   # RewardsControllerProxy
#verify 0x561879b3430dbFc0071004aE3BF640020a1aa9AD TransparentUpgradeableProxy   # StaticATokenFactoryProxy

# Proxy admin (OpenZeppelin)
#verify 0xdb3Bf3e22380780F75D7F57C772e71fCa7EBA027 ProxyAdmin

# Rewards Controller
#verify 0x484b0C602819d5A85bFFaC26E5B28c69F38c2941 RewardsController

# UI data providers (from aave-utilities)
# Common names: UiPoolDataProviderV3, UiIncentiveDataProviderV3
#verify 0x3Bb92CF81E38484183cc96a4Fb8fBd2d73535807 UiPoolDataProviderV3
#verify 0xD47dc1F30994539B3fA000C70bB5E5D0bE203b54 UiIncentiveDataProviderV3
#
# Static AToken factory + implementation (from static-a-token repo)
# Typical names: StaticATokenFactory and StaticATokenLM (or StaticATokenV3 in some deployments).
verify 0xe1A9577C8c9ca4182669E192C8167ACd9F7325df StataTokenFactory 
verify 0x4376C06D866557faC5d0B5813526639c403BfcF5 StataTokenV2 

# Misc infra
verify 0x390d2B4AFCCB4071fd163bcED7c715Bde06F0f4a TransparentProxyFactory

# Treasury (depending on deployment, this may be AaveEcosystemReserveV2 or similar)
# If this name mismatches, try AaveEcosystemReserveV2 or AaveEcosystemReserveController.
verify 0xA9A7e0E91689C49bf9F2A15a768cAebBA6A5EEC5 Collector 
verify 0x6A14A52bC00F60F6f13b960790Cf9a3D90267503 Collector 

# Tokens / wrappers (optional verifications if in scope)
verify 0x7D4b11BC3f57C2BE2274e5C8Aa8e93a5315bbEee AToken
verify 0x849140d62D1A298218EC974D2339BFC61fdf7D5C VariableDebtTokenInstance
verify 0x99478e5c8d0597730844Fd93dB8AB4723b96e149 WalletBalanceProvider
verify 0x49558c794ea2aC8974C9F27886DDfAa951E99171 WrappedTokenGatewayV3

echo "All verify commands submitted."

