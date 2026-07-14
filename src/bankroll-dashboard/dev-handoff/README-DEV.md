# $BANKROLL — Dev Handoff

Three components: `BANKROLL.sol` (token, fixed 4% tax → reward wallet),
`BatchSender.sol` (payout disperser), `distributor.js` (daily payout bot).
Dashboard front-end is separate (bankroll-dashboard.html/.jsx).

---

## ⚠️ STEP 0 — THE MAKE-OR-BREAK TEST (do this before anything else)

Robinhood Chain's DEX pairs run on **Uniswap V3/V4**. Classic V3 pools and
routers **do not support fee-on-transfer tokens** — swaps can revert because
the pool's balance accounting doesn't expect tokens to skim a fee mid-transfer.
V4 supports them only through custom hooks. If this token can't trade on the
chain's main DEX, nothing else matters.

**Test protocol (≈30 min, ~$50):**
1. Deploy the BANKROLL contract as-is with a throwaway name on the chain.
2. Create a small pool on the chain's primary DEX (the one Dexscreener shows
   for CASHCAT etc.), seed ~$50 of liquidity.
3. `setAMMPair(pool, true)`, remove your own tax exemption (`setTaxExempt(you,false)`).
4. Execute a BUY and a SELL through the chain's actual router/UI (not a direct
   pool call).
5. **Both succeed and the reward wallet balance grows by 4%** → green light,
   proceed below.
   **Either reverts** → STOP. The options then are: (a) find a V2-style AMM on
   the chain and host the main pool there, (b) build a V4 hook that implements
   the fee at pool level (bigger project — fee accrues in the swapped-in token,
   buys collect in the quote asset), or (c) drop the tax model. Do not launch a
   token that can't trade.

---

## Deployment order (after Step 0 passes)

1. **Create a dedicated distributor wallet** (fresh key, funded with gas,
   never holds anything else). This is `rewardWallet`.
2. Deploy `BANKROLL.sol` with the distributor address as constructor arg.
3. Deploy `BatchSender.sol`.
4. Create the pool + add liquidity from the deployer (deployer is tax-exempt,
   so the LP add isn't taxed).
5. `setAMMPair(pool, true)`.
6. `setTaxExempt(BatchSender, true)` — belt-and-suspenders; payouts are
   wallet-to-wallet and untaxed anyway.
7. **Verify the contract on the explorer** (single file, no imports — verifies
   clean on Blockscout).
8. Handle the LP position: V3/V4 liquidity is an NFT. Either send it to the
   dead address (permanent, forfeits pool fee claims) or lock it in a public
   locker. Whichever you do, say so publicly — it's the first thing checked.
9. Do one real buy + sell yourself. Confirm 4% lands in the distributor.
10. **`renounceOwnership()`** — after this the pair list, exemptions, reward
    wallet, and everything else are frozen forever. Triple-check config first.
11. Update the website: contract address, "renounced ✓", LP status, and the
    tax figure must match the contract exactly (4%/4%).

## Running the distributor

```bash
npm i ethers dotenv
cp .env.example .env   # fill in values from the ENV block in distributor.js
DRY_RUN=1 node distributor.js   # prints payout table, sends nothing
node distributor.js             # live run
```

- Cron it once daily at a fixed advertised hour; the script adds a random
  0–30 min jitter before the snapshot so snipers can't time it.
- Dust wallets (payout below MIN_PAYOUT) are skipped and automatically roll
  into the next day's pool — nobody loses anything, gas isn't wasted.
- Holders are pulled from the explorer API and contracts are excluded
  automatically; add the pool, lockers, and any CEX wallets to `EXCLUDE`.
- The Telegram vars post every payout tx to the public audit channel — run
  this from day one; it's the project's main trust asset.
- Key hygiene: the distributor key lives only on the cron machine, funded
  with gas weekly, nothing else ever on it.

## What this contract deliberately does NOT have

No mint. No pause. No blacklist. No adjustable tax (hard-coded constant, no
setter exists). No trading toggle. Renounce freezes everything. These are
absences to advertise — they're the anti-rug checklist degens actually read
the source for.

## Honest limitations to know

- **Unaudited reference code.** It's short and standard, but put a competent
  second pair of eyes (or a real audit) on it before real money touches it.
- Snapshot-based payouts reward whoever holds at snapshot time; the jitter
  mitigates sniping but a time-weighted-average-balance (TWAB) upgrade is the
  proper v2 (index Transfer events, weight by seconds held).
- Rewards are paid in $BANKROLL — their dollar value floats with the chart.
  The site already says this; keep it saying it.
- The 4% applies to every AMM trade including the deployer's after exemption
  removal — that's correct behavior, not a bug.
