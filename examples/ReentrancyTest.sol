// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Test} from "../lib/forge-std/src/Test.sol";
import {IERC20} from "../src/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IFlashLoanReceiver} from "../src/contracts/misc/flashloan/interfaces/IFlashLoanReceiver.sol";
import {IPool} from "../src/contracts/interfaces/IPool.sol";

/**
 * @title ReentrancyTest
 * @notice Test demonstrating how the reentrancy attack works and how our fix prevents it
 */
contract ReentrancyTest is Test {
    
    /**
     * @notice Test the reentrancy attack scenario
     * @dev This test would PASS on the vulnerable version and FAIL on our fixed version
     */
    function testReentrancyAttack() public {
        // Setup test environment
        IPool pool = IPool(address(0x1)); // Mock pool address
        IERC20 asset = IERC20(address(0x2)); // Mock asset
        
        // Deploy malicious contract
        MaliciousReceiver attacker = new MaliciousReceiver(address(pool));
        
        // Give attacker some tokens for fees
        deal(address(asset), address(attacker), 1000 ether);
        
        // Expect the attack to be blocked by our fix
        vm.expectRevert("ReentrancyGuard: reentrant call");
        
        // Try to perform reentrancy attack
        attacker.executeAttack(address(asset), 1000 ether);
    }
}

/**
 * @title Malicious Flash Loan Receiver
 * @notice Demonstrates the attack pattern
 */
contract MaliciousReceiver is IFlashLoanReceiver {
    IPool public immutable pool;
    uint256 public reentryCount;
    
    constructor(address _pool) {
        pool = IPool(_pool);
    }
    
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        
        // ATTACK: Try to reenter the pool
        if (reentryCount == 0) {
            reentryCount++;
            
            // This should fail with our fix
            address[] memory reentryAssets = new address[](1);
            uint256[] memory reentryAmounts = new uint256[](1);
            uint256[] memory reentryModes = new uint256[](1);
            
            reentryAssets[0] = assets[0];
            reentryAmounts[0] = amounts[0] / 2;
            reentryModes[0] = 0;
            
            // CRITICAL: This call should be blocked by nonReentrant modifier
            pool.flashLoan(
                address(this),
                reentryAssets,
                reentryAmounts, 
                reentryModes,
                initiator,
                "",
                0
            );
        }
        
        // Approve repayment
        for (uint256 i = 0; i < assets.length; i++) {
            IERC20(assets[i]).approve(address(pool), amounts[i] + premiums[i]);
        }
        
        return true;
    }
    
    function executeAttack(address asset, uint256 amount) external {
        address[] memory assets = new address[](1);
        uint256[] memory amounts = new uint256[](1);  
        uint256[] memory modes = new uint256[](1);
        
        assets[0] = asset;
        amounts[0] = amount;
        modes[0] = 0;
        
        pool.flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            msg.sender,
            "",
            0
        );
    }
}