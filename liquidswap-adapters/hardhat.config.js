require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify.parsec.finance",
    browserUrl: "https://repo.sourcify.dev",
  },
  networks: {
    hardhat: {
      forking: {
        url: "https://rpc.hyperliquid.xyz/evm",
      },
      chainId: 999, // Match HyperEVM's chainId
    },
    hyperEVM: {
      chainId: 999,
      url: "https://rpc.hyperliquid.xyz/evm",
      accounts: [process.env.PRIVATE_KEY],
    },
    hyperEVMTestnet: {
      chainId: 998,
      url: "https://rpc.hyperliquid-testnet.xyz/evm",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
