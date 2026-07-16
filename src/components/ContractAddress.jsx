import { useState } from 'react'
import { motion } from 'motion/react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS, CONTRACT_EXPLORER_URL } from '../lib/contract'

export default function ContractAddress() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <section
      id="buy"
      aria-label="Contract address"
      className="relative overflow-hidden bg-black px-5 py-14 sm:px-8 sm:py-16 md:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(176,16,48,0.16)_0%,transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,200,5,0.06)_0%,transparent_45%)]"
      />

      <motion.div
        className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-sans text-[0.7rem] font-semibold tracking-[0.28em] text-bankroll-gold uppercase sm:text-xs">
          Official contract
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
          Contract{' '}
          <span className="text-bankroll-green">
            Address
          </span>
        </h2>
        <p className="mt-3 max-w-md font-sans text-sm text-white/60 sm:text-base">
          Official $BANKROLL CA on Robinhood Chain. Copy it, verify it, then buy.
        </p>

        <div className="mt-8 w-full rounded-2xl border border-bankroll-gold/35 bg-black/70 px-5 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:px-8 sm:py-10">
          <p className="break-all font-mono text-sm font-semibold tracking-tight text-white sm:text-base md:text-lg">
            {CONTRACT_ADDRESS}
          </p>
          <p className="mt-3 font-sans text-sm tracking-[0.22em] text-bankroll-ruby uppercase sm:text-base">
            on Robinhood Chain
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-full border border-bankroll-gold/40 bg-bankroll-gold/10 px-5 py-2.5 font-sans text-sm font-semibold text-bankroll-gold transition hover:bg-bankroll-gold/20"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied' : 'Copy CA'}
            </button>
            <a
              href={CONTRACT_EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 font-sans text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              <ExternalLink className="size-4" />
              View on explorer
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
