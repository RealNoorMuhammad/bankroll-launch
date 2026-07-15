import { motion } from 'motion/react'
import leaf from '../assets/leaf.png'

const chapters = [
  {
    num: '01',
    title: 'The Line',
    body: 'They said if you dialed 1-800-BANKROLL you would get advice. They lied. The operators never helped. They only ever asked one question: did you check the chart?',
  },
  {
    num: '02',
    title: 'The Outlaw',
    body: 'Somewhere above the storm, a green hood sits at a marble desk and answers anyway — ruby phone glowing, city lightning for wallpaper. No safety net. No therapy. Just the open line.',
  },
  {
    num: '03',
    title: 'The Rule',
    body: 'On Robinhood Chain, $BANKROLL does not come to rescue you. It comes to remind you: no help, just profits. The only hotline that can\'t help you... but the chart can.',
  },
]

export default function Lore() {
  return (
    <section
      id="lore"
      aria-label="Lore"
      className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-20 md:py-24"
      style={{
        background:
          'linear-gradient(165deg, #1a050a 0%, #2b0812 28%, #140308 62%, #0a0204 100%)',
      }}
    >
      {/* Top divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#e8c87f]/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-r from-transparent via-[#b01030]/70 to-transparent blur-[1px]"
      />

      {/* Bottom divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-[#e8c87f]/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-gradient-to-r from-transparent via-[#b01030]/70 to-transparent blur-[1px]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(224,58,85,0.22)_0%,transparent_52%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(176,16,48,0.35)_0%,transparent_48%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)_0%,transparent_70%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 font-sans text-[0.7rem] font-semibold tracking-[0.28em] text-bankroll-gold uppercase sm:text-xs">
            <img
              src={leaf}
              alt=""
              className="size-4 object-contain opacity-90 brightness-0 invert-[.75] sepia-[.8] saturate-[3] hue-rotate-[10deg]"
              decoding="async"
            />
            The lore
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            A hotline built for{' '}
            <span className="text-bankroll-green">
              outlaws
            </span>
          </h2>
          <p className="mt-4 font-display text-lg text-white/70 italic sm:text-xl">
            No help. Just profits.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-6 lg:gap-10">
          {chapters.map((chapter, i) => (
            <motion.article
              key={chapter.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
              className="relative border-t border-[#e8c87f]/35 pt-6"
            >
              <p className="font-mono text-xs tracking-[0.2em] text-[#ff5a72] sm:text-sm">
                {chapter.num}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {chapter.title}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-white/70 sm:text-[0.95rem]">
                {chapter.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
