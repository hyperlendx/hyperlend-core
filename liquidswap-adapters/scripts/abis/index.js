export const multiHopAbi = require("../../artifacts/contracts/interfaces/ILiquidSwapMultiHopRouter.sol/ILiquidSwapMultiHopRouter.json").abi;
export const adapterABI = [
  "function buyOnLiquidSwap(bytes memory liquidswapData, address assetToSwapFrom, address assetToSwapTo, uint256 maxAmountToSwap, uint256 amountToReceive) external returns (uint256 amountSold, uint256 amountBought)",
];
export const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];
