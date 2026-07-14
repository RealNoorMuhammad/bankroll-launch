#!/usr/bin/env node
/**
 * $BANKROLL DAILY DISTRIBUTOR
 * ---------------------------------------------------------------
 * Run once a day (cron). What it does:
 *   1. Snapshots all holders from the chain explorer (Blockscout API)
 *   2. Excludes pair / dead / distributor / contract addresses
 *   3. Reads the reward wallet's $BANKROLL balance (today's collected tax)
 *   4. Allocates 100% pro-rata by balance
 *   5. Pays via BatchSender in chunks; skips dust (< MIN_PAYOUT) —
 *      unpaid dust stays in the reward wallet and rolls into tomorrow
 *   6. Posts every tx hash to the public audit Telegram channel
 *
 * ENV (put in .env, never commit):
 *   RPC_URL=            chain RPC endpoint
 *   PRIVATE_KEY=        distributor wallet key (DEDICATED wallet, gas-funded,
 *                       holds nothing but collected tax + gas)
 *   TOKEN=              BANKROLL contract address
 *   BATCH_SENDER=       BatchSender contract address
 *   EXPLORER_API=       e.g. https://<explorer>/api/v2
 *   EXCLUDE=            comma-separated extra exclusions (pair, lockers, CEX)
 *   MIN_PAYOUT=         min tokens per wallet per run (e.g. 100) — dust rolls over
 *   BATCH_SIZE=         recipients per tx (default 200)
 *   TG_BOT_TOKEN=       optional — audit channel bot
 *   TG_CHAT_ID=         optional — audit channel id
 *
 * RUN:  node distributor.js            (live)
 *       DRY_RUN=1 node distributor.js  (prints the payout table, sends nothing)
 */

require("dotenv").config();
const { ethers } = require("ethers"); // ethers v6

const {
  RPC_URL, PRIVATE_KEY, TOKEN, BATCH_SENDER, EXPLORER_API,
  EXCLUDE = "", MIN_PAYOUT = "100", BATCH_SIZE = "200",
  TG_BOT_TOKEN, TG_CHAT_ID, DRY_RUN,
} = process.env;

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
];
const BATCH_ABI = [
  "function batchSend(address token, address[] recipients, uint256[] amounts)",
];

const DEAD = [
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
];

async function tg(msg) {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: TG_CHAT_ID, text: msg, disable_web_page_preview: true }),
    });
  } catch (e) { console.error("telegram post failed:", e.message); }
}

async function fetchHolders() {
  const holders = [];
  let next = null, page = 0;
  do {
    const qs = next ? "?" + new URLSearchParams(next) : "";
    const res = await fetch(`${EXPLORER_API}/tokens/${TOKEN}/holders${qs}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`explorer ${res.status}`);
    const data = await res.json();
    for (const it of data.items || []) {
      holders.push({
        address: (it.address?.hash || it.address || "").toLowerCase(),
        isContract: Boolean(it.address?.is_contract),
        raw: BigInt(it.value),
      });
    }
    next = data.next_page_params || null;
    process.stdout.write(`\rholders page ${++page} — ${holders.length}`);
    await new Promise((r) => setTimeout(r, 250));
  } while (next);
  console.log("");
  return holders;
}

(async () => {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const token = new ethers.Contract(TOKEN, ERC20_ABI, wallet);
  const batch = new ethers.Contract(BATCH_SENDER, BATCH_ABI, wallet);
  const decimals = await token.decimals();
  const one = 10n ** BigInt(decimals);

  // Randomize snapshot minute (0–30 min jitter) so snipers can't
  // buy seconds before a predictable snapshot and dump after.
  if (!DRY_RUN) {
    const jitter = Math.floor(Math.random() * 30 * 60 * 1000);
    console.log(`jitter: waiting ${(jitter / 60000).toFixed(1)} min before snapshot…`);
    await new Promise((r) => setTimeout(r, jitter));
  }

  // 1. pool = today's collected tax sitting in the distributor wallet
  const pool = await token.balanceOf(wallet.address);
  console.log(`reward pool: ${ethers.formatUnits(pool, decimals)} BANKROLL`);
  if (pool === 0n) { console.log("nothing to distribute."); return; }

  // 2. snapshot + filter
  const exclude = new Set(
    [...DEAD, wallet.address.toLowerCase(), BATCH_SENDER.toLowerCase(), TOKEN.toLowerCase(),
     ...EXCLUDE.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean)]
  );
  const holders = (await fetchHolders())
    .filter((h) => h.address && !exclude.has(h.address))
    .filter((h) => !h.isContract) // pools/lockers/routers never collect
    .filter((h) => h.raw > 0n);

  const eligibleSupply = holders.reduce((s, h) => s + h.raw, 0n);
  console.log(`eligible wallets: ${holders.length} · eligible supply: ${ethers.formatUnits(eligibleSupply, decimals)}`);

  // 3. pro-rata allocation, dust rolls over
  const minPayout = BigInt(MIN_PAYOUT) * one;
  const payouts = holders
    .map((h) => ({ address: h.address, amount: (pool * h.raw) / eligibleSupply }))
    .filter((p) => p.amount >= minPayout);

  const totalOut = payouts.reduce((s, p) => s + p.amount, 0n);
  console.log(`paying ${payouts.length} wallets · ${ethers.formatUnits(totalOut, decimals)} BANKROLL (dust rolls over)`);

  if (DRY_RUN) {
    payouts.slice(0, 25).forEach((p) =>
      console.log(`  ${p.address}  ${ethers.formatUnits(p.amount, decimals)}`));
    console.log("DRY RUN — nothing sent.");
    return;
  }

  // 4. approve + batch send
  await (await token.approve(BATCH_SENDER, totalOut)).wait();
  const size = Number(BATCH_SIZE);
  const hashes = [];
  for (let i = 0; i < payouts.length; i += size) {
    const chunk = payouts.slice(i, i + size);
    const tx = await batch.batchSend(
      TOKEN,
      chunk.map((p) => p.address),
      chunk.map((p) => p.amount)
    );
    const rc = await tx.wait();
    hashes.push(rc.hash);
    console.log(`batch ${i / size + 1}: ${chunk.length} wallets · ${rc.hash}`);
  }

  // 5. public audit log
  await tg(
    `☎️ 1-800-BANKROLL DAILY PAYOUT\n` +
    `Paid: ${ethers.formatUnits(totalOut, decimals)} $BANKROLL\n` +
    `Wallets: ${payouts.length}\n` +
    hashes.map((h, i) => `tx ${i + 1}: ${h}`).join("\n")
  );
  console.log("done.");
})().catch((e) => { console.error(e); process.exit(1); });
