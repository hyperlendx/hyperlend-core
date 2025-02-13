// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import {PoolConfigurator} from '../protocol/pool/PoolConfigurator.sol';
import {Ownable} from '../dependencies/openzeppelin/contracts/Ownable.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';
import {IPool} from '../interfaces/IPool.sol';
import {SafeERC20} from '../dependencies/openzeppelin/contracts/SafeERC20.sol';

/**
 * @title ReservesSetupHelper
 * @author Aave & HyperLend
 * @notice Deployment helper to setup the assets risk parameters at PoolConfigurator in batch.
 * @dev The ReservesSetupHelper is an Ownable contract, so only the deployer or future owners can call this contract.
 */
contract ReservesSetupHelper is Ownable {
    using SafeERC20 for IERC20;

    struct ConfigureReserveInput {
        address asset;
        uint256 baseLTV;
        uint256 liquidationThreshold;
        uint256 liquidationBonus;
        uint256 reserveFactor;
        uint256 borrowCap;
        uint256 supplyCap;
        bool stableBorrowingEnabled;
        bool borrowingEnabled;
        bool flashLoanEnabled;
    }

    /**
     * @notice External function called by the owner account to setup the assets risk parameters in batch.
     * @dev The Pool or Risk admin must transfer the ownership to ReservesSetupHelper before calling this function
     * @param configurator The address of PoolConfigurator contract
     * @param inputParams An array of ConfigureReserveInput struct that contains the assets and their risk parameters
     * @param pool The address of the Pool
     * @param seedAmounts Amount of the asset to supply
     */
    function configureReserves(
        PoolConfigurator configurator,
        ConfigureReserveInput[] calldata inputParams,
        uint256[] calldata seedAmounts,
        address pool,
        address seedAmountsHolder
    ) external onlyOwner {
        for (uint256 i = 0; i < inputParams.length; i++) {
            configurator.configureReserveAsCollateral(
                inputParams[i].asset,
                inputParams[i].baseLTV,
                inputParams[i].liquidationThreshold,
                inputParams[i].liquidationBonus
            );

            if (inputParams[i].borrowingEnabled) {
                configurator.setReserveBorrowing(inputParams[i].asset, true);

                configurator.setBorrowCap(inputParams[i].asset, inputParams[i].borrowCap);
                configurator.setReserveStableRateBorrowing(
                    inputParams[i].asset,
                    inputParams[i].stableBorrowingEnabled
                );
            }
            configurator.setReserveFlashLoaning(
                inputParams[i].asset,
                inputParams[i].flashLoanEnabled
            );
            configurator.setSupplyCap(inputParams[i].asset, inputParams[i].supplyCap);
            configurator.setReserveFactor(inputParams[i].asset, inputParams[i].reserveFactor);

            _seedPool(inputParams[i].asset, pool, seedAmounts[i], seedAmountsHolder);
        }
    }

    function _seedPool(
        address token,
        address pool,
        uint256 amount,
        address seedAmountsHolder
    ) internal {
        require(amount >= 10000, 'seed amount too low');
        IERC20(token).safeTransferFrom(owner(), address(this), amount);
        IERC20(token).safeIncreaseAllowance(pool, amount);
        IPool(pool).supply(token, amount, seedAmountsHolder, 0);
    }
}
