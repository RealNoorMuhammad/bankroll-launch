import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Wallet, Fuel, ArrowLeftRight, BadgeCheck } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    num: '01',
    icon: Wallet,
    title: 'Create a wallet',
    body: 'Grab the Robinhood Wallet app or the MetaMask extension and follow the steps to set up your wallet. Guard that seed phrase like it funds the whole bankroll.',
  },
  {
    num: '02',
    icon: Fuel,
    title: 'Get some $ETH',
    body: 'Buy or bridge ETH over to the Robinhood Chain. Once it lands in your wallet, the line is open.',
  },
  {
    num: '03',
    icon: ArrowLeftRight,
    title: 'Swap $ETH for $BANKROLL',
    body: 'Head to your favourite DEX on the Robinhood Chain. When the CA drops, paste the $BANKROLL address into the swap menu and smash confirm.',
  },
  {
    num: '04',
    icon: BadgeCheck,
    title: 'You are now a $BANKROLL holder',
    body: 'Approve the transaction and leave a little ETH in the wallet for gas. Welcome to the hotline — you\'re one of us now.',
  },
]

const SMOKE_COUNT = 14

export default function HowToBuy() {
  const sectionRef = useRef(null)
  const smokeRef = useRef(null)
  const titleRef = useRef(null)
  const stepsRef = useRef(null)
  const caRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const smokeClouds = smokeRef.current?.querySelectorAll('.smoke-cloud') || []
      const stepCards = stepsRef.current?.children || []

      gsap.set(smokeClouds, {
        y: 40,
        opacity: 0,
        scale: 0.85,
      })
      gsap.set([titleRef.current, caRef.current], { y: 24, opacity: 0 })
      gsap.set(stepCards, { y: 28, opacity: 0, rotateX: 6 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      })

      // Content first so the section feels immediate; smoke is atmosphere only
      tl.to(titleRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.45,
        ease: 'power3.out',
      })
        .to(
          stepCards,
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power3.out',
          },
          0.08,
        )
        .to(
          caRef.current,
          { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out' },
          0.22,
        )
        .to(
          smokeClouds,
          {
            y: -20,
            opacity: 0.5,
            scale: 1.1,
            duration: 0.7,
            stagger: { each: 0.03, from: 'center' },
            ease: 'power2.out',
          },
          0,
        )

      smokeClouds.forEach((cloud, i) => {
        gsap.to(cloud, {
          y: `-=${70 + (i % 5) * 18}`,
          x: i % 2 === 0 ? '+=40' : '-=40',
          opacity: 0,
          duration: 4 + (i % 3),
          delay: 0.35 + i * 0.03,
          ease: 'sine.inOut',
          repeat: -1,
          repeatDelay: 0.15,
          onRepeat() {
            gsap.set(cloud, {
              y: 60 + (i % 3) * 20,
              opacity: 0.35 + (i % 4) * 0.06,
            })
          },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="howtobuy"
      aria-label="How to buy $BANKROLL"
      className="relative isolate overflow-hidden bg-black px-5 py-20 sm:px-8 sm:py-24 md:py-28"
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

      {/* Rising smoke layer */}
      <div
        ref={smokeRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {Array.from({ length: SMOKE_COUNT }).map((_, i) => (
          <span
            key={i}
            className="smoke-cloud absolute rounded-full"
            style={{
              left: `${6 + ((i * 7) % 88)}%`,
              bottom: `${-8 + (i % 5) * 6}%`,
              width: `${140 + (i % 5) * 55}px`,
              height: `${90 + (i % 4) * 40}px`,
              background:
                i % 3 === 0
                  ? 'radial-gradient(ellipse at center, rgba(176,16,48,0.45) 0%, rgba(176,16,48,0.08) 45%, transparent 70%)'
                  : i % 3 === 1
                    ? 'radial-gradient(ellipse at center, rgba(204,255,0,0.18) 0%, rgba(204,255,0,0.04) 40%, transparent 70%)'
                    : 'radial-gradient(ellipse at center, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 42%, transparent 70%)',
              filter: 'blur(28px)',
            }}
          />
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom,rgba(176,16,48,0.2)_0%,transparent_55%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div ref={titleRef} className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-[0.7rem] font-semibold tracking-[0.28em] text-bankroll-gold uppercase sm:text-xs">
            Dial the market
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            How to buy{' '}
            <span className="text-bankroll-green [text-shadow:0_0_28px_rgba(204,255,0,0.4)]">
              $BANKROLL
            </span>
          </h2>
          <p className="mt-4 font-display text-lg text-white/70 italic sm:text-xl">
            Four steps. No help. Just the chart.
          </p>
        </div>

        <div
          ref={stepsRef}
          className="mt-12 grid gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 md:gap-6 lg:gap-7"
          style={{ perspective: '1000px' }}
        >
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <article
                key={step.num}
                className="group relative overflow-hidden rounded-2xl border border-bankroll-gold/25 bg-black/55 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-7"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full bg-[radial-gradient(circle,rgba(176,16,48,0.28)_0%,transparent_70%)] opacity-70 transition duration-500 group-hover:opacity-100"
                />

                <div className="relative flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-bankroll-gold/40 bg-gradient-to-br from-[#3a2418] to-black text-bankroll-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                    <Icon className="size-5" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[0.7rem] tracking-[0.22em] text-bankroll-ruby">
                      {step.num}
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-white/65 sm:text-[0.95rem]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div
          ref={caRef}
          className="mx-auto mt-10 max-w-2xl rounded-2xl border border-bankroll-green/25 bg-black/60 px-5 py-5 text-center backdrop-blur-md sm:mt-12 sm:px-6"
        >
          <p className="font-sans text-[0.65rem] tracking-[0.2em] text-white/45 uppercase">
            Contract address
          </p>
          <p className="mt-2 font-display text-xl font-bold text-white sm:text-2xl">
            Coming Soon
          </p>
          <p className="mt-1 font-sans text-xs tracking-[0.2em] text-bankroll-green uppercase sm:text-sm">
            on Robinhood Chain
          </p>
        </div>
      </div>
    </section>
  )
}
