
const {ethers} = require("hardhat");


/**
 * Creates an EIP-2612 permit signature for token approval
 *
 * This function generates a permit signature that allows a spender (adapter contract)
 * to spend a specific amount of tokens on behalf of the signer without requiring a separate
 * approval transaction. It follows the EIP-2612 standard for permit signatures.
 *
 * @param {ethers.Signer} signer - The ethers signer object (wallet) that will sign the permit
 * @param {string} aTokenAddress - The address of the token contract to be approved
 * @param {string|ethers.BigNumber} debtRepayAmount - The amount of tokens to approve for spending
 * @param {string} REPAY_ADAPTER_ADDRESS - The address of the adapter contract that will be the spender
 * @returns {Object} permitSignature - An object containing the signature components
 * @returns {string|ethers.BigNumber} permitSignature.amount - The approved token amount
 * @returns {number} permitSignature.deadline - The timestamp when the permit expires (1 hour from now)
 * @returns {number} permitSignature.v - The recovery parameter of the signature
 * @returns {string} permitSignature.r - The r component of the signature
 * @returns {string} permitSignature.s - The s component of the signature
 * @throws {Error} If there's an issue with retrieving token information or signing the permit
 */
async function permitSignature(signer, aTokenAddress, debtRepayAmount, REPAY_ADAPTER_ADDRESS) {
  let permitSignature;
  // Manual EIP-2612 permit signing
  const tokenContract = new ethers.Contract(
    aTokenAddress,
    [
      "function nonces(address owner) view returns (uint256)",
      "function name() view returns (string)",
      "function version() view returns (string)",
      "function DOMAIN_SEPARATOR() view returns (bytes32)"
    ],
    signer
  );

  try {
    // Get token details
    const nonce = await tokenContract.nonces(signer.address);
    console.log("Nonce:", nonce.toString());

    const name = await tokenContract.name();
    console.log("Token name:", name);

    let version = "1"; // Default version
    try {
      version = await tokenContract.version();
      console.log("Token version:", version);
    } catch (error) {
      console.log("Token doesn't have version method, using default:", version);
    }

    // Get chainId directly from the provider to avoid hardfork issues
    let chainId;
    try {
      const network = await ethers.provider.getNetwork();
      chainId = network.chainId;
    } catch (error) {
      console.log("Error getting chainId from provider, using hardcoded value:", error);
      // Use the chainId from hardhat.config.js for HyperEVM
      chainId = 999;
    }
    console.log("Chain ID:", chainId);

    const deadline = Math.floor(Date.now() / 1000) + 3600;

    // Create the permit message
    const domain = {
      name,
      version,
      chainId,
      verifyingContract: aTokenAddress
    };
    console.log("domain", domain);
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" }
      ]
    };

    const message = {
      owner: signer.address,
      spender: REPAY_ADAPTER_ADDRESS,
      value: debtRepayAmount,
      nonce,
      deadline
    };

    console.log("Signing permit with domain:", domain);
    console.log("Signing permit with message:", message);

    // Sign the permit
    const signature = await signer.signTypedData(domain, types, message);
    const sig = ethers.Signature.from(signature);

    // Create the permit signature object
    permitSignature = {
      amount: debtRepayAmount,
      deadline,
      v: sig.v,
      r: sig.r,
      s: sig.s
    };

    console.log("Permit signature created:", permitSignature);
  } catch (error) {
    console.error("Error creating permit signature:", error);
    throw error;
  }

  return permitSignature;
}

module.exports = {
  permitSignature
};
