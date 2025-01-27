require("dotenv").config();

require("@nomicfoundation/hardhat-toolbox");
require("hardhat-preprocessor");
require("solidity-coverage");
require("@nomicfoundation/hardhat-verify");

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
            chainId: 1337,
        },
        hyperEvmTestnet: {
            accounts: [process.env.PRIVATE_KEY],
            chainId: 998,
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
                        bytecodeHash: "none",
                    },
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    etherscan: {
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
    sourcify: {
        enabled: true,
        apiUrl: "https://sourcify.parsec.finance",
        browserUrl: "https://sourcify.parsec.finance/",
    },
};

module.exports = config