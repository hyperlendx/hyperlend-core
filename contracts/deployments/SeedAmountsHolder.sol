// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../dependencies/openzeppelin/contracts/Ownable.sol';
import '../interfaces/IPool.sol';

///@notice contract used to hold seed amount of funds for all markets, so there is always some liquidity (prevent possible rounding exploits)
contract SeedAmountsHolder is Ownable {
    event FundsWithdrawn(address pool, address asset, uint256 amount);

    constructor() Ownable() {}

    //should only be called if the entire pool is deprecated
    function withdrawFunds(address pool, address asset, uint256 amount) external onlyOwner() {
        IPool(pool).withdraw(asset, amount, owner());
        emit FundsWithdrawn(pool, asset, amount);
    }
}