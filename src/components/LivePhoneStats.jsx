import { AnimatePresence, motion } from 'motion/react'

function formatCount(n) {
  return Number(n || 0).toLocaleString('en-US')
}

export default function LivePhoneStats({ ringCount, floaters }) {
  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-4 z-30 flex items-end justify-between gap-3 md:inset-x-auto md:top-24 md:right-8 md:bottom-auto md:flex-col md:items-end md:gap-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        className="flex items-center gap-2 rounded-full border border-bankroll-gold/35 bg-black/75 px-3 py-1.5 backdrop-blur-md sm:px-3.5 sm:py-2"
      >
        <span className="relative flex size-2.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-bankroll-green opacity-70" />
          <span className="relative size-2.5 rounded-full bg-bankroll-green shadow-[0_0_12px_rgba(204,255,0,0.8)]" />
        </span>
        <span className="font-sans text-[0.65rem] font-semibold tracking-[0.18em] text-bankroll-green uppercase sm:text-[0.7rem]">
          Live
        </span>
      </motion.div>

      <div className="relative flex flex-col items-end">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.52 }}
          className="rounded-2xl border border-bankroll-gold/30 bg-black/75 px-3.5 py-2.5 backdrop-blur-md sm:px-5 sm:py-3.5"
        >
          <p className="font-sans text-[0.6rem] tracking-[0.2em] text-bankroll-gold/90 uppercase sm:text-[0.65rem]">
            Total taps
          </p>
          <p className="mt-0.5 font-display text-xl leading-none font-bold text-white tabular-nums sm:text-3xl md:text-4xl">
            {formatCount(ringCount)}
          </p>
          <p className="mt-1 hidden font-sans text-[0.65rem] text-white/50 sm:block sm:text-xs">
            Each ring counts worldwide
          </p>
        </motion.div>

        <div className="pointer-events-none absolute bottom-full right-1 mb-1 h-10 w-16">
          <AnimatePresence>
            {floaters.map((floater) => (
              <motion.span
                key={floater.id}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: -28, scale: 1.05 }}
                exit={{ opacity: 0, y: -56 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 font-display text-xl font-bold text-bankroll-green [text-shadow:0_0_18px_rgba(204,255,0,0.55)] sm:text-2xl"
              >
                +1
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
