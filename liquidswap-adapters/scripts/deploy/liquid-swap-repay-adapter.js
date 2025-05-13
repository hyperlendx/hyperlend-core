const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying LiquidSwapRepayAdapter...");

  // Get contract addresses from environment variables
  const poolAddressesProvider = process.env.POOL_ADDRESSES_PROVIDER;
  const multiHopRouter = process.env.MULTIHOP_ROUTER_ADDRESS;
  const ownerAddress = process.env.OWNER_ADDRESS;

  // Validate required environment variables
  if (!poolAddressesProvider) {
    throw new Error("POOL_ADDRESSES_PROVIDER environment variable is not set");
  }
  if (!multiHopRouter) {
    throw new Error("MULTIHOP_ROUTER environment variable is not set");
  }
  if (!ownerAddress) {
    throw new Error("OWNER_ADDRESS environment variable is not set");
  }

  console.log("Using the following addresses:");
  console.log(`- Pool Addresses Provider: ${poolAddressesProvider}`);
  console.log(`- MultiHop Router: ${multiHopRouter}`);
  console.log(`- Owner Address: ${ownerAddress}`);

  // Get the network configuration
  const network = await hre.ethers.provider.getNetwork();
  console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy the contract with the correct constructor arguments and explicit gas settings
  console.log("Creating contract factory...");
  const LiquidSwapRepayAdapter = await hre.ethers.getContractFactory("LiquidSwapRepayAdapter");

  console.log("Starting deployment...");
  const adapter = await LiquidSwapRepayAdapter.deploy(
    poolAddressesProvider,
    multiHopRouter,
    ownerAddress,
    {
      maxFeePerGas: hre.ethers.parseUnits("8", "gwei"),
      maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
    }
  );

  console.log(`Deployment transaction hash: ${adapter.deploymentTransaction().hash}`);
  console.log("Waiting for transaction confirmation...");

  // Wait for the contract to be deployed
  await adapter.waitForDeployment();

  // Get the contract address
  const adapterAddress = await adapter.getAddress();

  console.log(`LiquidSwapRepayAdapter deployed to: ${adapterAddress}`);
  console.log("Deployment complete!");

  return adapterAddress;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
