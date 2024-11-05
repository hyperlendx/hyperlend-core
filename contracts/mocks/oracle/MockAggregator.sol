// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockHyperEvmOracleProxy {
    uint256 public price;
    string public description;
    uint256 public decimals;
    address public asset;

    constructor(string memory _description, uint256 _decimals, address _asset, uint256 _price) {
        description = _description;
        decimals = _decimals;
        asset = _asset;
        price = _price;
    }

    function latestAnswer() external view returns (uint256) {
        return price; //return mock price
    }

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        roundId = 0;
        answer = int256(price);
        startedAt = block.timestamp;
        updatedAt = block.timestamp;
        answeredInRound = 0;
    }

    function setPrice(uint256 _price) external {
        price = _price;
    }
}
