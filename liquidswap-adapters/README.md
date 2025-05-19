# LiquidSwap Adapters

A collection of smart contract adapters for integrating HyperLend with LiquidSwap on HyperEVM. These adapters enable token swaps, liquidity provision, and debt repayment using LiquidSwap's liquidity pools.

## Overview

This project provides several adapters for interacting with LiquidSwap's MultiHopRouter:

- **BaseLiquidSwapBuyAdapter**: Core adapter for buying a specific amount of target tokens for a maximum amount of source tokens
- **BaseLiquidSwapSellAdapter**: Core adapter for selling a specific amount of source tokens for a minimum amount of target tokens
- **LiquidSwapRepayAdapter**: Adapter for repaying debt using collateral through LiquidSwap

## Prerequisites

- Node.js (v16+)
- npm
- Hardhat

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on the `.env.example` template:

```
# Network RPC URLs
HYPEREVM_TESTNET_RPC=
HYPEREVM_RPC=

# Contract addresses
POOL_ADDRESSES_PROVIDER=
MULTIHOP_ROUTER_ADDRESS=
BASE_LIQUIDSWAP_BUY_ADAPTER_ADDRESS=
OWNER_ADDRESS=

# Etherscan API key for verification
SOURCIFY_URL=
```

## Usage

### Compilation

```bash
npm run compile
```

### Testing

**Prerequisites for Testing:**

1. Fund your wallet with some HYPE for gas.
2. Visit the HyperLend testnet interface: https://looping-testnet.hyperlend-interface-staging.pages.dev/
3. Supply approximately 0.5 HYPE as collateral
4. Borrow approximately 0.2 wstHYPE against your collateral


These positions are required for the integration tests to properly validate the adapter functionality with existing lending positions.

```bash
npm test
```

### Deployment

#### Deploy Base LiquidSwap Repay Adapter

```bash
# Mainnet network
npm deploy
```

## Architecture

The adapters follow a hierarchical structure:

1. **BaseLiquidSwapAdapter**: Base contract with common utilities for all adapters
2. **BaseLiquidSwapBuyAdapter** and **BaseLiquidSwapSellAdapter**: Specialized adapters for buy and sell operations
3. **LiquidSwapRepayAdapter**: Specialized adapter for debt repayment

## Key Features

- **Buy Operations**: Buy a specific amount of target token (toToken) for a maximum amount of source token (fromToken)
- **Sell Operations**: Sell a specific amount of source token for a minimum amount of target token
- **Repay Operations**: Swap collateral for debt asset and repay loans
- **Slippage Protection**: Built-in maximum slippage control (30%)
- **Permit Support**: ERC20 permit functionality for gasless approvals

## License

BUSL-1.1
