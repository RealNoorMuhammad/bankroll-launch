import React, { useEffect, useMemo, useState } from "react";
import { Phone, Timer } from "lucide-react";

// ─────────────────────────────────────────────
// $BANKROLL · 1-800-BANKROLL · Holder Rewards (DEMO)
// ─────────────────────────────────────────────
const SUPPLY = 100_000_000;
const TAX = 0.04;              // 4% on every buy and sell — 100% to holders
const CYCLE_HOURS = 24;

const fmtUSD = (n, d = 2) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtNum = (n) => Number(n).toLocaleString("en-US");
const fmtCompact = (n) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = CYCLE_HOURS * 3600 * 1000;
  const rem = ms - (now % ms);
  const pad = (x) => String(x).padStart(2, "0");
  return {
    label: `${pad(Math.floor(rem / 3600000))}:${pad(Math.floor((rem % 3600000) / 60000))}:${pad(Math.floor((rem % 60000) / 1000))}`,
    pct: 1 - rem / ms,
  };
}

const GOLD = "#C7A45C", GOLDHI = "#F1D9A0", MUT = "#8A6A3B", BODY = "#C9B79E", LINE = "#3A2418";

export default function BankrollDashboard() {
  const [holdings, setHoldings] = useState(500_000);
  const [volume, setVolume] = useState(500_000);
  const [marketCap, setMarketCap] = useState(2_000_000);
  const { label: countdown, pct } = useCountdown();

  const calc = useMemo(() => {
    const price = marketCap / SUPPLY;
    const pool = volume * TAX;
    const share = Math.min(holdings / SUPPLY, 1);
    const daily = pool * share;
    const value = holdings * price;
    return {
      price, pool, share, daily, value,
      weekly: daily * 7, monthly: daily * 30, yearly: daily * 365,
      apr: value > 0 ? (daily * 365 / value) * 100 : 0,
      eligible: holdings > 0,
    };
  }, [holdings, volume, marketCap]);

  const Slider = ({ label, value, display, min, max, step, onChange, presets, hint }) => (
    <div className="mt-6 first:mt-0">
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span style={{ color: BODY }}>{label}</span>
        <span className="font-mono" style={{ color: GOLDHI }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red-700"
      />
      {presets && (
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((v) => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className="rounded-full border px-3 py-1 font-mono text-xs"
              style={{
                borderColor: value === v ? GOLD : LINE,
                color: value === v ? GOLDHI : "#9C8869",
                background: value === v ? "#221508" : "transparent",
              }}
            >
              {fmtCompact(v)}
            </button>
          ))}
        </div>
      )}
      {hint && <div className="mt-2 text-xs" style={{ color: MUT }}>{hint}</div>}
    </div>
  );

  return (
    <div className="min-h-screen w-full" style={{ background: "#0A0705", color: "#F4EDE3", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {/* top bar */}
      <div className="border-b" style={{ borderColor: "#241610", background: "rgba(10,7,5,0.9)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: GOLD, background: "radial-gradient(circle at 30% 30%, #8E1020, #4A0810)" }}>
              <Phone size={15} color={GOLDHI} />
            </div>
            <div className="text-lg font-bold tracking-wide">
              1-800<span style={{ color: "#C33A4B" }}>-BANKROLL</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border px-3 py-1 font-mono text-[10px] tracking-widest" style={{ borderColor: LINE, color: "#B08D4F" }}>
              DEMO
            </span>
            <button className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "linear-gradient(180deg,#B31B2C,#7C0F1D)", color: "#FBEFE0" }}>
              Buy $BANKROLL
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-16">
        {/* hero — unboxed */}
        <div className="pt-12 pb-2 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl leading-tight sm:text-5xl">
            Hold $BANKROLL. Get paid daily. <span style={{ color: "#E0B15E" }}>Automatically.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed" style={{ color: BODY, fontFamily: "system-ui, sans-serif" }}>
            Every trade pays a 4% buy and sell tax — 100% of it goes straight back to holders every 24 hours, paid in $BANKROLL.
          </p>
          <div className="mt-5 font-mono text-[11px] tracking-widest" style={{ color: MUT }}>
            4% TAX PER TRADE&nbsp;&nbsp;·&nbsp;&nbsp;PAID EVERY 24H IN $BANKROLL&nbsp;&nbsp;·&nbsp;&nbsp;0% KEPT BY TEAM
          </div>
        </div>

        {/* money card — total paid + countdown */}
        <div className="mt-10 rounded-2xl border" style={{ borderColor: GOLD, background: "linear-gradient(160deg,#1A110C 0%,#120B08 60%,#0D0806 100%)", boxShadow: "0 0 70px rgba(179,27,44,0.10)" }}>
          <div className="grid gap-0 md:grid-cols-5">
            <div className="border-b p-8 text-center md:col-span-3 md:border-b-0 md:border-r" style={{ borderColor: "#241610" }}>
              <div className="text-[11px] uppercase" style={{ color: GOLD, letterSpacing: "0.22em" }}>
                Total paid out to holders
              </div>
              <div className="mt-4 font-mono text-6xl sm:text-7xl" style={{ color: GOLDHI, textShadow: "0 0 40px rgba(224,177,94,0.25)" }}>
                {fmtUSD(calc.pool * 14, 0)}
              </div>
              <div className="mt-4 font-mono text-[11px]" style={{ color: MUT }}>
                USD value · sample — 14 days at your volume setting
              </div>
            </div>
            <div className="p-8 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase" style={{ color: GOLD, letterSpacing: "0.22em" }}>Next payout</div>
                <Timer size={14} color={GOLD} />
              </div>
              <div className="mt-4 text-center font-mono text-4xl tracking-widest" style={{ color: GOLDHI }}>
                {countdown}
              </div>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full" style={{ background: "#241610" }}>
                <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: "linear-gradient(90deg,#7C0F1D,#C33A4B,#E0B15E)" }} />
              </div>
              <div className="mt-5 space-y-3 font-mono text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: MUT }}>Pool per day</span>
                  <span style={{ color: "#E9DCC3" }}>{fmtUSD(calc.pool, 0)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: MUT }}>You per day</span>
                  <span style={{ color: "#E9DCC3" }}>{fmtUSD(calc.daily)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* calculator + receipt */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border p-7" style={{ borderColor: LINE, background: "#110B08" }}>
            <div className="text-[11px] uppercase" style={{ color: GOLD, letterSpacing: "0.22em" }}>Payout calculator</div>
            <div className="mt-6" style={{ fontFamily: "system-ui, sans-serif" }}>
              <Slider
                label="Your $BANKROLL balance"
                value={holdings} display={fmtNum(holdings)}
                min={0} max={5_000_000} step={5_000}
                onChange={setHoldings}
                hint={`= ${(100 * holdings / SUPPLY).toFixed(3)}% of the 100M supply`}
              />
              <Slider
                label="24h volume (USD)"
                value={volume} display={fmtUSD(volume, 0)}
                min={10_000} max={10_000_000} step={10_000}
                onChange={setVolume}
                presets={[100_000, 500_000, 1_000_000, 5_000_000]}
              />
              <Slider
                label="Market cap (USD)"
                value={marketCap} display={fmtUSD(marketCap, 0)}
                min={100_000} max={20_000_000} step={100_000}
                onChange={setMarketCap}
                presets={[500_000, 2_000_000, 10_000_000]}
                hint={`Token price ${fmtUSD(calc.price, 4)} → your balance is worth ${fmtUSD(calc.value)}`}
              />
            </div>
          </div>

          {/* receipt */}
          <div
            className="rounded-2xl border p-7"
            style={{
              background: "linear-gradient(180deg,#F7EFDC 0%,#EFE3C8 100%)",
              borderColor: GOLD, color: "#2A1B10",
              fontFamily: "'Courier New', monospace",
            }}
          >
            <div className="flex items-center justify-between border-b border-dashed pb-3" style={{ borderColor: "#B49A6A" }}>
              <div>
                <div className="text-[10px] tracking-widest">CALL RECORD</div>
                <div className="text-lg font-bold tracking-wide">1-800-BANKROLL</div>
              </div>
              <Phone size={18} />
            </div>
            <div className="space-y-1 border-b border-dashed py-3 text-sm" style={{ borderColor: "#B49A6A" }}>
              <div className="flex justify-between"><span>BALANCE</span><span>{fmtNum(holdings)} BNKRL</span></div>
              <div className="flex justify-between"><span>SHARE OF SUPPLY</span><span>{(calc.share * 100).toFixed(4)}%</span></div>
              <div className="flex justify-between"><span>PAYOUT ASSET</span><span>$BANKROLL</span></div>
              <div className="flex justify-between"><span>≈ TOKENS / DAY</span><span>{calc.eligible ? fmtNum(Math.round(calc.daily / calc.price)) + " BNKRL" : "—"}</span></div>
              <div className="flex justify-between"><span>LINE STATUS</span><span className="font-bold">{calc.eligible ? "CONNECTED ✓" : "NO BALANCE"}</span></div>
            </div>
            <div className="space-y-2 border-b border-dashed py-4" style={{ borderColor: "#B49A6A" }}>
              {[["DAILY", calc.daily], ["WEEKLY", calc.weekly], ["MONTHLY", calc.monthly], ["YEARLY", calc.yearly]].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between">
                  <span className="text-xs">{k}</span>
                  <span className="text-base font-bold">{calc.eligible ? fmtUSD(v) : "—"}</span>
                </div>
              ))}
            </div>
            <div className="flex items-baseline justify-between pt-4">
              <span className="text-xs">EST. ANNUAL RATE*</span>
              <span className="text-2xl font-bold">{calc.eligible ? calc.apr.toFixed(1) + "%" : "—"}</span>
            </div>
            <div className="pt-3 text-[10px] leading-snug">
              *USD value at the settings you chose. Rewards are paid in $BANKROLL, so their
              dollar value moves with the token price. Real payouts vary with actual volume
              and holders, can be zero, and are never guaranteed. Not financial advice.
            </div>
          </div>
        </div>

        {/* footer — trust + disclaimer merged */}
        <div className="mt-12 border-t pt-6" style={{ borderColor: "#241610" }}>
          <div className="font-mono text-[11px] tracking-wide" style={{ color: GOLD }}>
            100% OF THE TAX → HOLDERS · PAID IN $BANKROLL · NO TEAM ALLOCATION · DISTRIBUTOR WALLET PUBLIC
          </div>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: MUT, fontFamily: "system-ui, sans-serif" }}>
            Demo build — every figure is calculated from the assumptions you set above; nothing is
            live market data yet. $BANKROLL is a memecoin, not an investment product, and is not
            affiliated with Robinhood. Nothing on this page is financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
