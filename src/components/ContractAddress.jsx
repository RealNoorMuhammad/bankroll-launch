import { motion } from 'motion/react'

export default function ContractAddress() {
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(204,255,0,0.06)_0%,transparent_45%)]"
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
          <span className="text-bankroll-green [text-shadow:0_0_24px_rgba(204,255,0,0.35)]">
            Address
          </span>
        </h2>
        <p className="mt-3 max-w-md font-sans text-sm text-white/60 sm:text-base">
          The CA drops when the line goes live. Stay on the chart.
        </p>

        <div className="mt-8 w-full rounded-2xl border border-bankroll-gold/35 bg-black/70 px-5 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md sm:px-8 sm:py-10">
          <p className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
            Coming Soon
          </p>
          <p className="mt-3 font-sans text-sm tracking-[0.22em] text-bankroll-green uppercase sm:text-base">
            on Robinhood Chain
          </p>
        </div>
      </motion.div>
    </section>
  )
}
