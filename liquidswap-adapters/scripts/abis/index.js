const buyAdapterABI = [
  "function buyOnLiquidSwap(bytes memory liquidswapData, address assetToSwapFrom, address assetToSwapTo, uint256 maxAmountToSwap, uint256 amountToReceive) external returns (uint256 amountSold, uint256 amountBought)",
];
const erc20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const repayAdapterABI = [
  "function swapAndRepay(address collateralAsset, address debtAsset, uint256 collateralAmount, uint256 debtRepayAmount, uint256 debtRateMode, uint256 buyAllBalanceOffset, bytes calldata liquidswapData, tuple(uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) calldata permitSignature) external",
];

const multiHopAbi = require("../../artifacts/contracts/interfaces/ILiquidSwapMultiHopRouter.sol/ILiquidSwapMultiHopRouter.json").abi;


module.exports = {
  buyAdapterABI,
  erc20ABI,
  repayAdapterABI,
  multiHopAbi
};
