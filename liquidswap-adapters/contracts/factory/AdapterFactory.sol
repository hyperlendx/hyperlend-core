// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.10;

import {IPoolAddressesProvider} from 'hyperlend-core/src/contracts/interfaces/IPoolAddressesProvider.sol';
import {ILiquidSwapMultiHopRouter} from '../interfaces/ILiquidSwapMultiHopRouter.sol';
import {TestLiquidSwapBuyAdapter} from '../test/TestLiquidSwapBuyAdapter.sol';

/**
 * @title AdapterFactory
 * @notice Factory contract to deploy TestLiquidSwapBuyAdapter with reduced gas costs
 * @author Kristjan Bajuk
 */
contract AdapterFactory {
    event AdapterDeployed(address indexed adapterAddress);

    /**
     * @notice Deploys a new TestLiquidSwapBuyAdapter
     * @param addressesProvider The address of the PoolAddressesProvider
     * @param multiHopRouter The address of the LiquidSwap MultiHopRouter
     * @param owner The address that will own the adapter
     * @return adapter The address of the deployed adapter
     */
    function deployAdapter(
        IPoolAddressesProvider addressesProvider,
        ILiquidSwapMultiHopRouter multiHopRouter,
        address owner
    ) external returns (address adapter) {
        TestLiquidSwapBuyAdapter newAdapter = new TestLiquidSwapBuyAdapter(
            addressesProvider,
            multiHopRouter,
            owner
        );
        
        adapter = address(newAdapter);
        emit AdapterDeployed(adapter);
    }
}
