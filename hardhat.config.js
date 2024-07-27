const fs = require("fs");
const { HardhatUserConfig }  = require("hardhat/config");
require("dotenv").config();

require("hardhat-gas-reporter");
require("hardhat-preprocessor");
require("solidity-coverage");

require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");

// Ensure that we have all the environment variables we need.
const mnemonic = process.env.MNEMONIC;
const arbitrumUrl = process.env.ARBITRUM_URL;

const chainIds = {
  hardhat: 1337,
  mainnet: 1,
  "polygon-mainnet": 137,
  rinkeby: 4,
  arbitrum: 42161
};

function getRemappings() {
  return fs
    .readFileSync("remappings.txt", "utf8")
    .split("\n")
    .map((line) => line.trim().split("="));
}

const config = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    enabled: true,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      gas: "auto",
      accounts: {
        mnemonic,
      },
      chainId: chainIds.hardhat,
    },
    arbitrum: {
        accounts: [process.env.PRIVATE_KEY],
        chainId: chainIds.arbitrum,
        url: arbitrumUrl,
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
  }
};

module.exports = config