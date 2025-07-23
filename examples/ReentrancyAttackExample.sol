// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IERC20} from "../src/contracts/dependencies/openzeppelin/contracts/IERC20.sol";
import {IFlashLoanReceiver} from "../src/contracts/misc/flashloan/interfaces/IFlashLoanReceiver.sol";
import {IPool} from "../src/contracts/interfaces/IPool.sol";

/**
 * @title ReentrancyAttackExample
 * @notice Example showing how flash loan reentrancy attack could work BEFORE our fix
 * @dev THIS IS FOR EDUCATIONAL PURPOSES ONLY - DO NOT USE MALICIOUSLY
 */
contract MaliciousFlashLoanReceiver is IFlashLoanReceiver {
    IPool public immutable POOL;
    address public immutable ASSET;
    uint256 public attackCount;
    bool public attackActive;

    constructor(address pool, address asset) {
        POOL = IPool(pool);
        ASSET = asset;
    }

    /**
     * @notice This function would be called by the Pool during flash loan execution
     * @dev In the VULNERABLE version, this could reenter the Pool contract
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        // Verify this was called by the pool
        require(msg.sender == address(POOL), "Caller must be pool");
        
        // ATTACK VECTOR 1: Double Flash Loan Attack
        // In the vulnerable version, we could call flashLoan again here
        if (attackActive && attackCount < 2) {
            attackCount++;
            
            // This would cause reentrancy in the vulnerable version
            address[] memory reentryAssets = new address[](1);
            uint256[] memory reentryAmounts = new uint256[](1);
            uint256[] memory reentryModes = new uint256[](1);
            
            reentryAssets[0] = ASSET;
            reentryAmounts[0] = amounts[0] / 2; // Smaller amount
            reentryModes[0] = 0; // No debt mode
            
            // THIS WOULD WORK IN VULNERABLE VERSION - causes reentrancy
            // But our fix prevents this with nonReentrant modifier
            try POOL.flashLoan(
                address(this),  // receiver
                reentryAssets,  // assets
                reentryAmounts, // amounts  
                reentryModes,   // interest rate modes
                initiator,      // onBehalfOf
                "",            // params
                0              // referral code
            ) {
                // In vulnerable version: This executes and we get nested flash loans
                // With our fix: This reverts with "ReentrancyGuard: reentrant call"
            } catch Error(string memory reason) {
                // Our fix causes this to revert
                require(
                    keccak256(bytes(reason)) == keccak256("ReentrancyGuard: reentrant call"),
                    "Unexpected revert reason"
                );
            }
        }

        // ATTACK VECTOR 2: State Manipulation Attack  
        if (attackActive && attackCount == 0) {
            attackCount++;
            
            // In vulnerable version, we could manipulate pool state here
            // For example, try to call supply/withdraw/borrow during flash loan
            try POOL.supply(ASSET, amounts[0] / 10, address(this), 0) {
                // This would work in vulnerable version - allowing state manipulation
                // With our fix: This reverts due to nonReentrant protection
            } catch Error(string memory reason) {
                // Our fix prevents this
                require(
                    keccak256(bytes(reason)) == keccak256("ReentrancyGuard: reentrant call"),
                    "Supply should be blocked by reentrancy guard"
                );
            }
        }

        // Normal flash loan logic - approve repayment
        for (uint256 i = 0; i < assets.length; i++) {
            uint256 repayAmount = amounts[i] + premiums[i];
            IERC20(assets[i]).approve(address(POOL), repayAmount);
        }

        return true;
    }

    /**
     * @notice Start the attack
     * @dev This would demonstrate the vulnerability before our fix
     */
    function startAttack(uint256 amount) external {
        attackActive = true;
        attackCount = 0;

        address[] memory assets = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        uint256[] memory modes = new uint256[](1);

        assets[0] = ASSET;
        amounts[0] = amount;
        modes[0] = 0; // No debt mode

        // In vulnerable version: This would succeed and allow reentrancy
        // With our fix: The reentrancy attempts inside executeOperation will fail
        POOL.flashLoan(
            address(this),  // receiver
            assets,         // assets
            amounts,        // amounts
            modes,          // modes
            msg.sender,     // onBehalfOf
            "",            // params
            0              // referral
        );

        attackActive = false;
    }
}

/**
 * @title Attack Scenario Documentation
 * @notice Demonstrates different attack vectors that were possible before our fix
 */
contract AttackScenarios {
    
    /**
     * SCENARIO 1: Double Flash Loan Attack
     * =====================================
     * 
     * VULNERABLE FLOW (Before Fix):
     * 1. Attacker calls Pool.flashLoan(1000 ETH)
     * 2. Pool transfers 1000 ETH to attacker
     * 3. Pool calls attacker.executeOperation()
     * 4. Inside executeOperation, attacker calls Pool.flashLoan(500 ETH) again
     * 5. Pool transfers another 500 ETH (now 1500 ETH total borrowed)
     * 6. Nested executeOperation runs
     * 7. Inner flash loan "completes" but only repays 500 ETH
     * 8. Outer flash loan "completes" but only repays 1000 ETH  
     * 9. Pool accounting is broken - 1500 ETH borrowed, 1500 ETH repaid, but fees calculated wrong
     * 
     * IMPACT: Fee calculation errors, accounting inconsistencies, potential fund loss
     */

    /**
     * SCENARIO 2: State Manipulation Attack  
     * ======================================
     * 
     * VULNERABLE FLOW (Before Fix):
     * 1. Attacker calls Pool.flashLoan(1000 ETH)
     * 2. Pool updates virtual balances: virtualBalance -= 1000 ETH
     * 3. Pool transfers 1000 ETH to attacker  
     * 4. Pool calls attacker.executeOperation()
     * 5. Inside executeOperation, attacker calls Pool.supply(500 ETH)
     * 6. Pool.supply() runs while flash loan is still active
     * 7. Virtual balance calculations become inconsistent
     * 8. Interest rate calculations use manipulated state
     * 9. Attacker repays flash loan with manipulated rates
     * 
     * IMPACT: Interest rate manipulation, unfair borrowing costs, economic attacks
     */

    /**
     * SCENARIO 3: Liquidation Manipulation
     * ====================================
     * 
     * VULNERABLE FLOW (Before Fix):
     * 1. User has position close to liquidation threshold
     * 2. Attacker calls Pool.flashLoan() to get funds
     * 3. Inside executeOperation, attacker calls Pool.liquidationCall()
     * 4. Liquidation logic runs while flash loan state is inconsistent
     * 5. Health factor calculations may be wrong due to virtual balance issues
     * 6. Attacker gets unfair liquidation bonus
     * 7. Flash loan is repaid with profit from manipulated liquidation
     * 
     * IMPACT: Unfair liquidations, MEV extraction, user fund loss
     */
}