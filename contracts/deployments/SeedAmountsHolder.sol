// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import '../dependencies/openzeppelin/contracts/Ownable.sol';
import '../interfaces/IPool.sol';
import {DataTypes} from '../protocol/libraries/types/DataTypes.sol';

///@notice contract used to hold seed amount of funds for all markets, so there is always some liquidity (prevent possible rounding exploits)
contract SeedAmountsHolder is Ownable {
    event FundsWithdrawn(address pool, address asset, uint256 amount);

    constructor() {}

    //should only be called if the entire pool is deprecated
    function withdrawFunds(address pool, address asset, uint256 amount) external onlyOwner {
        DataTypes.ReserveConfigurationMap memory configurationMap = IPool(pool).getConfiguration(
            asset
        );
        require(((configurationMap.data >> 58) & 1) == 0, 'borrow must be disabled for reserve');

        IPool(pool).withdraw(asset, amount, owner());
        emit FundsWithdrawn(pool, asset, amount);
    }
}
