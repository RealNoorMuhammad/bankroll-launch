// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * ─────────────────────────────────────────────────────────────
 *  1-800-BANKROLL ($BANKROLL)
 *  Fixed-supply ERC-20 · 4% tax on AMM buys/sells → reward wallet
 *  100% of collected tax is redistributed to holders daily by an
 *  off-chain distributor (see distributor.js). No mint. No burn
 *  authority. No blacklist. Tax is a hard-coded constant and can
 *  never be changed. Contract is designed to be renounced after
 *  setup (see README-DEV.md deployment order).
 * ─────────────────────────────────────────────────────────────
 */
contract BANKROLL {
    string public constant name = "1-800-BANKROLL";
    string public constant symbol = "BANKROLL";
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 100_000_000 * 1e18;

    /// 4.00% — immutable by design. There is no setter. Ever.
    uint256 public constant TAX_BPS = 400;
    uint256 private constant BPS = 10_000;

    address public owner;
    address public rewardWallet;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    /// AMM pool addresses — transfers to/from these are taxed.
    mapping(address => bool) public isAMMPair;
    /// Addresses exempt from tax (deployer during LP add, distributor, batch sender).
    mapping(address => bool) public isTaxExempt;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TaxCollected(address indexed from, address indexed to, uint256 amount);
    event PairSet(address indexed pair, bool isPair);
    event TaxExemptSet(address indexed account, bool exempt);
    event RewardWalletSet(address indexed wallet);
    event OwnershipRenounced();

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _rewardWallet) {
        require(_rewardWallet != address(0), "reward wallet zero");
        owner = msg.sender;
        rewardWallet = _rewardWallet;
        isTaxExempt[msg.sender] = true;
        isTaxExempt[_rewardWallet] = true;
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    // ── admin (all become inert after renounce) ────────────────
    function setAMMPair(address pair, bool state) external onlyOwner {
        require(pair != address(0), "zero");
        isAMMPair[pair] = state;
        emit PairSet(pair, state);
    }

    function setTaxExempt(address account, bool state) external onlyOwner {
        isTaxExempt[account] = state;
        emit TaxExemptSet(account, state);
    }

    /// One-way safety: reward wallet can be updated only before renounce
    /// (e.g. rotating the distributor key). After renounce it is frozen.
    function setRewardWallet(address wallet) external onlyOwner {
        require(wallet != address(0), "zero");
        rewardWallet = wallet;
        isTaxExempt[wallet] = true;
        emit RewardWalletSet(wallet);
    }

    function renounceOwnership() external onlyOwner {
        owner = address(0);
        emit OwnershipRenounced();
    }

    // ── ERC-20 ─────────────────────────────────────────────────
    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= value, "allowance");
        if (allowed != type(uint256).max) {
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        require(from != address(0) && to != address(0), "zero addr");
        uint256 bal = balanceOf[from];
        require(bal >= value, "balance");

        // Tax applies only when an AMM pair is on either side (buy or sell)
        // and neither side is exempt. Plain wallet-to-wallet transfers
        // (including daily reward payouts) are never taxed.
        bool taxed = (isAMMPair[from] || isAMMPair[to])
            && !isTaxExempt[from]
            && !isTaxExempt[to];

        unchecked {
            balanceOf[from] = bal - value;
        }

        if (taxed) {
            uint256 fee = (value * TAX_BPS) / BPS;
            uint256 net = value - fee;
            balanceOf[rewardWallet] += fee;
            balanceOf[to] += net;
            emit Transfer(from, rewardWallet, fee);
            emit Transfer(from, to, net);
            emit TaxCollected(from, to, fee);
        } else {
            balanceOf[to] += value;
            emit Transfer(from, to, value);
        }
    }
}
