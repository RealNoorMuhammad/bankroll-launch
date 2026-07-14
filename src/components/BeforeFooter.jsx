import { Phone } from 'lucide-react'
import beforeFooterDesktop from '../assets/beforefooterdesktop.png'
import beforeFooterMobile from '../assets/beforefootermobile.png'

const CALL_HREF = 'tel:18002657655'

export default function BeforeFooter() {
  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Before footer"
    >
      <img
        src={beforeFooterMobile}
        alt=""
        className="block h-auto w-full object-cover object-center md:hidden"
        width={941}
        height={1672}
        decoding="async"
      />
      <img
        src={beforeFooterDesktop}
        alt=""
        className="hidden h-auto w-full object-cover object-center md:block"
        width={1672}
        height={941}
        decoding="async"
      />

      <div className="absolute inset-0 flex items-center justify-center px-5 py-16 sm:px-8 md:items-center md:py-10">
        <div className="relative flex w-full max-w-3xl -translate-y-[calc(8%-60px)] flex-col items-center text-center md:-translate-y-[calc(6%-60px)]">
          {/* Soft black light-shadow for legibility */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[155%] w-[115%] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.72)_38%,rgba(0,0,0,0.35)_68%,transparent_100%)] blur-[2px] md:h-[140%] md:w-[105%] md:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.32)_45%,transparent_75%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/55 blur-3xl md:bg-black/25 md:blur-2xl"
          />

          <div className="relative z-10 flex flex-col items-center">
            <p className="font-sans text-[0.7rem] font-medium uppercase tracking-[0.22em] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_18px_rgba(0,0,0,0.85),0_0_40px_rgba(0,0,0,0.65)] sm:text-xs md:text-sm md:tracking-[0.28em] md:[text-shadow:0_1px_2px_rgba(0,0,0,0.8),0_0_16px_rgba(0,0,0,0.55)]">
              The only hotline that can&apos;t help you...
            </p>

            <h2 className="mt-3 font-display text-[2.15rem] leading-[1.05] font-bold tracking-tight text-white uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_28px_rgba(0,0,0,0.9),0_0_56px_rgba(0,0,0,0.7)] sm:mt-4 sm:text-5xl md:text-6xl md:[text-shadow:0_2px_4px_rgba(0,0,0,0.85),0_0_24px_rgba(0,0,0,0.55)] lg:text-7xl">
              But the{' '}
              <span className="text-bankroll-green [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_20px_rgba(204,255,0,0.55),0_0_48px_rgba(0,0,0,0.8)]">
                Chart
              </span>{' '}
              Can.
            </h2>

            <a
              href={CALL_HREF}
              className="btn-ruby-diamond mt-7 px-5 py-3 font-sans text-sm sm:mt-9 sm:gap-3 sm:px-7 sm:py-3.5 sm:text-base md:text-lg"
            >
              <Phone
                className="btn-ruby-icon size-4 shrink-0 sm:size-5"
                strokeWidth={2.25}
                aria-hidden
              />
              CALL 1-800-BANKROLL
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
