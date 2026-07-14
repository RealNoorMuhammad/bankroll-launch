import React, { useEffect, useMemo, useState } from "react";
import {
  Phone, Timer, Landmark, Users, Gem, TrendingUp, Settings2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// $BANKROLL · 1-800-BANKROLL · Holder Rewards Dashboard (DEMO)
// Fixed parameters of the token design
// ─────────────────────────────────────────────────────────────
const SUPPLY = 100_000_000;      // total supply
const TAX = 0.04;                // 4% on every buy and sell
const SPLIT = { holders: 1.0 }; // 100% of the tax is redistributed
const MIN_HOLD = 5_000;          // minimum balance to qualify for payouts
const CYCLE_HOURS = 24;          // payout once every 24 hours

const fmtUSD = (n, d = 2) =>
  "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtNum = (n, d = 0) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtCompact = (n) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const cycleMs = CYCLE_HOURS * 3600 * 1000;
  const remaining = cycleMs - (now % cycleMs);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  const pad = (x) => String(x).padStart(2, "0");
  return { label: `${pad(h)}:${pad(m)}:${pad(s)}`, pct: 1 - remaining / cycleMs };
}

const Label = ({ children }) => (
  <div className="text-xs tracking-widest uppercase" style={{ color: "#C7A45C", letterSpacing: "0.18em" }}>
    {children}
  </div>
);

const Card = ({ children, className = "", style = {} }) => (
  <div
    className={"rounded-2xl border p-5 " + className}
    style={{ background: "linear-gradient(160deg,#1A110C 0%,#120B08 60%,#0D0806 100%)", borderColor: "#3A2418", ...style }}
  >
    {children}
  </div>
);

export default function BankrollDashboard() {
  // adjustable market assumptions (demo)
  const [holdings, setHoldings] = useState(500_000);
  const [volume, setVolume] = useState(500_000);
  const [marketCap, setMarketCap] = useState(2_000_000);
  const [eligibleSupply, setEligibleSupply] = useState(60_000_000);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { label: countdown, pct } = useCountdown();

  const calc = useMemo(() => {
    const price = marketCap / SUPPLY;
    const taxCollected = volume * TAX;
    const holderPool = taxCollected * SPLIT.holders;
    const share = Math.min(holdings / Math.max(eligibleSupply, 1), 1);
    const daily = holderPool * share;
    const holdingsValue = holdings * price;
    const apr = holdingsValue > 0 ? ((daily * 365) / holdingsValue) * 100 : 0;
    return {
      price, taxCollected, holderPool, share, daily,
      weekly: daily * 7, monthly: daily * 30, yearly: daily * 365,
      perCycle: daily / (24 / CYCLE_HOURS),
      holdingsValue, apr,
      eligible: holdings >= MIN_HOLD,
    };
  }, [holdings, volume, marketCap, eligibleSupply]);

  const input =
    "w-full rounded-lg border bg-black/50 px-3 py-2 font-mono text-sm outline-none focus:ring-1";

  return (
    <div className="min-h-screen w-full" style={{ background: "#0A0705", color: "#F4EDE3", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="mx-auto max-w-6xl px-4 pb-16">
        {/* hero: thesis + countdown */}
        <div className="grid gap-4 pt-8 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <Label>Holder rewards line</Label>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
              The hotline pays out <span style={{ color: "#E0B15E" }}>every 24 hours.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: "#C9B79E", fontFamily: "system-ui, sans-serif" }}>
              Every buy and sell pays a 4% tax — and 100% of it is paid straight back to
              qualified holders, once a day, in WETH. Nothing is kept. Enter your
              balance and a volume assumption to estimate your payout.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ["Tax per trade", "4%"],
                ["Payout cycle", "24h"],
                ["Min. balance", fmtCompact(MIN_HOLD)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border px-3 py-3 text-center" style={{ borderColor: "#3A2418", background: "#0F0A07" }}>
                  <div className="font-mono text-lg" style={{ color: "#F1D9A0" }}>{v}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: "#8A6A3B" }}>{k}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Next payout</Label>
              <Timer size={15} color="#C7A45C" />
            </div>
            <div className="mt-4 text-center font-mono text-5xl tracking-widest" style={{ color: "#F1D9A0" }}>
              {countdown}
            </div>
            <div className="mx-auto mt-4 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "#241610" }}>
              <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: "linear-gradient(90deg,#7C0F1D,#C33A4B,#E0B15E)" }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border px-3 py-3" style={{ borderColor: "#3A2418" }}>
                <div className="font-mono text-lg" style={{ color: "#E9DCC3" }}>{fmtUSD(calc.holderPool / (24 / CYCLE_HOURS), 0)}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: "#8A6A3B" }}>Est. pool / day</div>
              </div>
              <div className="rounded-xl border px-3 py-3" style={{ borderColor: "#3A2418" }}>
                <div className="font-mono text-lg" style={{ color: "#E9DCC3" }}>{fmtUSD(calc.perCycle)}</div>
                <div className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: "#8A6A3B" }}>Your est. / day</div>
              </div>
            </div>
          </Card>
        </div>

        {/* snapshot row */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            [<Gem size={14} key="g" />, "Token price", fmtUSD(calc.price, 4)],
            [<Landmark size={14} key="l" />, "Market cap", fmtUSD(marketCap, 0)],
            [<TrendingUp size={14} key="t" />, "24h volume", fmtUSD(volume, 0)],
            [<Users size={14} key="u" />, "Total supply", fmtCompact(SUPPLY)],
          ].map(([icon, k, v]) => (
            <div key={k} className="rounded-xl border px-4 py-3" style={{ borderColor: "#3A2418", background: "#100A07" }}>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest" style={{ color: "#8A6A3B" }}>
                {icon} {k}
              </div>
              <div className="mt-1 font-mono text-xl" style={{ color: "#F1D9A0" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* calculator + receipt */}
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {/* inputs */}
          <Card>
            <Label>Payout calculator</Label>
            <div className="mt-4 space-y-5" style={{ fontFamily: "system-ui, sans-serif" }}>
              <div>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span style={{ color: "#C9B79E" }}>Your $BANKROLL balance</span>
                  <span className="font-mono" style={{ color: "#F1D9A0" }}>{fmtNum(holdings)}</span>
                </div>
                <input
                  type="range" min={0} max={5_000_000} step={5_000}
                  value={holdings}
                  onChange={(e) => setHoldings(Number(e.target.value))}
                  className="w-full accent-red-700"
                />
                <input
                  type="number" min={0}
                  value={holdings}
                  onChange={(e) => setHoldings(Math.max(0, Number(e.target.value)))}
                  className={input}
                  style={{ borderColor: "#3A2418", color: "#F4EDE3" }}
                />
                <div className="mt-1 text-xs" style={{ color: "#8A6A3B" }}>
                  = {(100 * holdings / SUPPLY).toFixed(3)}% of total supply · worth {fmtUSD(calc.holdingsValue)} at current assumptions
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span style={{ color: "#C9B79E" }}>Assumed 24h volume (USD)</span>
                  <span className="font-mono" style={{ color: "#F1D9A0" }}>{fmtUSD(volume, 0)}</span>
                </div>
                <input
                  type="range" min={10_000} max={10_000_000} step={10_000}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-red-700"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[100_000, 500_000, 1_000_000, 5_000_000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVolume(v)}
                      className="rounded-full border px-3 py-1 font-mono text-xs"
                      style={{
                        borderColor: volume === v ? "#C7A45C" : "#3A2418",
                        color: volume === v ? "#F1D9A0" : "#9C8869",
                        background: volume === v ? "#221508" : "transparent",
                      }}
                    >
                      {fmtCompact(v)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs uppercase tracking-widest"
                style={{ color: "#C7A45C" }}
              >
                <Settings2 size={13} /> {showAdvanced ? "Hide" : "Show"} market assumptions
              </button>

              {showAdvanced && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-1 text-sm" style={{ color: "#C9B79E" }}>Market cap (USD)</div>
                    <input
                      type="number" min={10_000} step={50_000}
                      value={marketCap}
                      onChange={(e) => setMarketCap(Math.max(10_000, Number(e.target.value)))}
                      className={input}
                      style={{ borderColor: "#3A2418", color: "#F4EDE3" }}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-sm" style={{ color: "#C9B79E" }}>Eligible supply (tokens)</div>
                    <input
                      type="number" min={1_000_000} step={1_000_000}
                      value={eligibleSupply}
                      onChange={(e) => setEligibleSupply(Math.max(1_000_000, Number(e.target.value)))}
                      className={input}
                      style={{ borderColor: "#3A2418", color: "#F4EDE3" }}
                    />
                    <div className="mt-1 text-xs" style={{ color: "#8A6A3B" }}>
                      Supply held by qualifying wallets (excludes LP + burned).
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* receipt — the signature element */}
          <div className="relative">
            <div
              className="rounded-2xl border p-6"
              style={{
                background: "linear-gradient(180deg,#F7EFDC 0%,#EFE3C8 100%)",
                borderColor: "#C7A45C",
                color: "#2A1B10",
                fontFamily: "'Courier New', monospace",
                boxShadow: "0 0 60px rgba(179,27,44,0.15)",
              }}
            >
              <div className="flex items-center justify-between border-b border-dashed pb-3" style={{ borderColor: "#B49A6A" }}>
                <div>
                  <div className="text-xs tracking-widest">CALL RECORD</div>
                  <div className="text-lg font-bold tracking-wide">1-800-BANKROLL</div>
                </div>
                <Phone size={20} />
              </div>

              <div className="space-y-1 border-b border-dashed py-3 text-sm" style={{ borderColor: "#B49A6A" }}>
                <div className="flex justify-between"><span>CALLER BALANCE</span><span>{fmtNum(holdings)} BNKRL</span></div>
                <div className="flex justify-between"><span>POOL SHARE</span><span>{(calc.share * 100).toFixed(4)}%</span></div>
                <div className="flex justify-between"><span>LINE STATUS</span>
                  <span className="font-bold">{calc.eligible ? "CONNECTED ✓" : `ON HOLD — MIN ${fmtNum(MIN_HOLD)}`}</span>
                </div>
              </div>

              <div className="space-y-2 border-b border-dashed py-3" style={{ borderColor: "#B49A6A" }}>
                {[
                  ["DAILY (1 CYCLE)", calc.daily],
                  ["WEEKLY", calc.weekly],
                  ["MONTHLY (30D)", calc.monthly],
                  ["YEARLY (365D)", calc.yearly],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between">
                    <span className="text-xs">{k}</span>
                    <span className="text-base font-bold">{calc.eligible ? fmtUSD(v) : "—"}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-baseline justify-between pt-3">
                <span className="text-xs">EST. ANNUAL RATE*</span>
                <span className="text-2xl font-bold">{calc.eligible ? calc.apr.toFixed(1) + "%" : "—"}</span>
              </div>
              <div className="pt-2 text-[10px] leading-snug">
                *Estimate at the volume, market cap and eligible-supply assumptions set on the left.
                Payouts depend entirely on actual traded volume and holder count — they change
                constantly and are not guaranteed. Not financial advice.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
