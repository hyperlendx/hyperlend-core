const fs = require("fs");
const { HardhatUserConfig }  = require("hardhat/config");
require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-preprocessor");
require("solidity-coverage");
require("@nomicfoundation/hardhat-verify");

const chainIds = {
  hardhat: 1337,
  hyperEvmTestnet: 998
};

function getRemappings() {
  return fs
    .readFileSync("remappings.txt", "utf8")
    .split("\n")
    .map((line) => line.trim().split("="));
}

const mnemonic = process.env.MNEMONIC;

const config = {
  defaultNetwork: "hardhat",
//   gasReporter: {
//     currency: "USD",
//     enabled: true,
//     excludeContracts: [],
//     src: "./contracts",
//   },
  networks: {
    hardhat: {
      gas: "auto",
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    hyperEvmTestnet: {
      accounts: [process.env.PRIVATE_KEY],
      chainId: chainIds.hyperEvmTestnet,
      url: 'https://api.hyperliquid-testnet.xyz/evm',
    }
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          viaIR: true,
          metadata: {
            // Not including the metadata hash
            // https://github.com/paulrberg/solidity-template/issues/31
            bytecodeHash: "none",
          },
          // Disable the optimizer when debugging
          // https://hardhat.org/hardhat-network/#solidity-optimizer-support
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: {
        hyperEvmTestnet: 'empty',
    },
    customChains: [
        {
          network: "hyperEvmTestnet",
          chainId: 998,
          urls: {
            apiURL: "https://explorer.hyperlend.finance/api",
            browserURL: "https://explorer.hyperlend.finance"
          }
        }
      ]
  },
};

module.exports = config