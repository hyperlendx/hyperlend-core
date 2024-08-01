// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import {IHyperlendIncentivesController} from '../../interfaces/IHyperlendIncentivesController.sol';

contract MockIncentivesController is IHyperlendIncentivesController {
    function handleAction(address, uint256, uint256) external override {}
}
