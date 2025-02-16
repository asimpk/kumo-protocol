// SPDX-License-Identifier: MIT

pragma solidity 0.8.15;

import "../ActivePool.sol";

contract ActivePoolTester is ActivePool {
    using SafeMath for uint256;

    function unprotectedIncreaseKUSDDebt(address _asset, uint256 _amount) external {
        KUSDDebts[_asset] = KUSDDebts[_asset].add(_amount);
    }
}