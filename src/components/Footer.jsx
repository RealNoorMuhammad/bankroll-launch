import leaf from '../assets/leaf.png'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full bg-black">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between md:gap-6 md:px-10 md:py-8 lg:px-14">
        <Link
          to="/"
          className="shrink-0 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl"
          aria-label="1-800-BANKROLL home"
        >
          $BANKROLL
        </Link>

        <p className="order-3 text-center font-sans text-[0.7rem] tracking-wide text-white/90 md:order-none md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:text-xs">
          © {new Date().getFullYear()} 1-800-BANKROLL. All rights reserved.
          <span className="mt-1 block tracking-[0.18em] text-white/45 uppercase">
            No help. Just profits.
          </span>
        </p>

        <div className="flex items-center gap-2 font-sans text-sm text-white sm:text-base">
          <span className="text-white/90">No rescue.</span>
          <img
            src={leaf}
            alt=""
            className="h-6 w-auto object-contain sm:h-7"
            decoding="async"
            aria-hidden
          />
          <span className="font-semibold tracking-wide">Robinhood Chain</span>
        </div>
      </div>
    </footer>
  )
}
