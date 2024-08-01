// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;

import {HToken} from '../../protocol/tokenization/HToken.sol';
import {IPool} from '../../interfaces/IPool.sol';

contract MockHToken is HToken {
    constructor(IPool pool) HToken(pool) {}

    function getRevision() internal pure override returns (uint256) {
        return 0x2;
    }
}
