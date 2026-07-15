const items = [
  { text: '1-800-BANKROLL', accent: true },
  { text: 'No help. Just profits.' },
  { text: 'But the chart can.' },
  { text: '$BANKROLL', accent: true },
  { text: 'Dial in. Cash out.' },
  { text: 'Built on Robinhood' },
  { text: 'The line is open.', accent: true },
]

function RubyDiamond() {
  return (
    <span aria-hidden className="relative inline-flex size-2.5 shrink-0 sm:size-3">
      <span className="absolute inset-0 rotate-45 rounded-[1px] bg-[#ff2d4a] shadow-[0_0_10px_rgba(255,45,74,0.85),0_0_18px_rgba(176,16,48,0.55)]" />
      <span className="absolute inset-[2px] rotate-45 rounded-[0.5px] bg-gradient-to-tr from-white/55 via-[#ff6b7f] to-[#9a0c24]" />
    </span>
  )
}

function Track() {
  const sequence = [...items, ...items]

  return (
    <div className="marquee-track flex w-max items-center gap-6 sm:gap-8 md:gap-10">
      {sequence.map((item, i) => (
        <span key={`${item.text}-${i}`} className="flex items-center gap-6 sm:gap-8 md:gap-10">
          <span
            className={`whitespace-nowrap font-display text-[1.55rem] leading-none font-bold tracking-tight uppercase sm:text-[1.85rem] md:text-[2.05rem] ${
              item.accent
                ? 'text-bankroll-green'
                : 'text-white'
            }`}
          >
            {item.text}
          </span>
          <RubyDiamond />
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  return (
    <section
      aria-label="Bankroll ticker"
      className="relative overflow-hidden bg-black"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black to-transparent sm:w-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black to-transparent sm:w-20"
      />

      <div className="marquee-row relative py-3.5 sm:py-4 md:py-5">
        <Track />
      </div>
    </section>
  )
}
