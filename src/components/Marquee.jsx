import leaf from '../assets/leaf.png'

const items = [
  { text: '1-800-BANKROLL', accent: true },
  { text: 'No help. Just profits.' },
  { text: 'But the chart can.' },
  { text: '$BANKROLL', accent: true },
  { text: 'Dial in. Cash out.' },
  { text: 'Built on Robinhood' },
  { text: 'The line is open.', accent: true },
]

function RobinhoodLeaf() {
  return (
    <img
      src={leaf}
      alt=""
      aria-hidden
      decoding="async"
      className="h-3.5 w-auto shrink-0 object-contain sm:h-4 md:h-[1.15rem]"
      style={{
        filter:
          'brightness(0) saturate(100%) invert(58%) sepia(96%) saturate(1800%) hue-rotate(73deg) brightness(1.05)',
      }}
    />
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
          <RobinhoodLeaf />
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
