// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/**
 * BatchSender — minimal disperse contract for the daily $BANKROLL payout.
 * The distributor wallet approves this contract, then calls batchSend in
 * chunks (~200 recipients per tx). Stateless, ownerless, holds no funds.
 */
contract BatchSender {
    event BatchSent(address indexed token, uint256 recipients, uint256 total);

    function batchSend(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external {
        require(recipients.length == amounts.length, "length mismatch");
        uint256 total;
        for (uint256 i = 0; i < recipients.length; i++) {
            require(
                IERC20(token).transferFrom(msg.sender, recipients[i], amounts[i]),
                "transfer failed"
            );
            total += amounts[i];
        }
        emit BatchSent(token, recipients.length, total);
    }
}
