import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles } from 'lucide-react'
import leaf from '../assets/leaf.png'

gsap.registerPlugin(ScrollTrigger)

const frames = [
  { label: 'Vault reel', span: 'md:col-span-2 md:row-span-2', tall: true },
  { label: 'Desk cut', span: '' },
  { label: 'Night dial', span: '' },
  { label: 'Storm call', span: 'md:col-span-2' },
]

export default function Gallery() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)
  const gridRef = useRef(null)
  const badgeRef = useRef(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.children || []

      gsap.set([badgeRef.current, titleRef.current], { y: 36, opacity: 0 })
      gsap.set(cards, { y: 48, opacity: 0, scale: 0.94 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          once: true,
        },
      })

      tl.to(badgeRef.current, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' })
        .to(titleRef.current, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, '-=0.45')
        .to(
          cards,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
          },
          '-=0.4',
        )

      gsap.to('.gallery-shimmer', {
        backgroundPosition: '200% center',
        duration: 2.8,
        repeat: -1,
        ease: 'none',
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="gallery"
      aria-label="Gallery"
      className="relative isolate overflow-hidden px-5 py-20 sm:px-8 sm:py-24 md:py-28"
      style={{
        background:
          'linear-gradient(180deg, #050505 0%, #0c0407 40%, #050505 100%)',
      }}
    >
      {/* Dividers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#e8c87f]/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-gradient-to-r from-transparent via-[#b01030]/70 to-transparent blur-[1px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-[#e8c87f]/80 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[3px] bg-gradient-to-r from-transparent via-[#b01030]/70 to-transparent blur-[1px]"
      />

      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(176,16,48,0.28)_0%,transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(204,255,0,0.07)_0%,transparent_45%)]"
      />
      <div
        aria-hidden
        className="gallery-shimmer pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(110deg, transparent 20%, rgba(232,200,127,0.08) 45%, transparent 70%)',
          backgroundSize: '200% 100%',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-bankroll-gold/40 bg-black/50 px-3.5 py-1.5 backdrop-blur-md"
          >
            <Sparkles className="size-3.5 text-bankroll-green" strokeWidth={2} aria-hidden />
            <span className="font-sans text-[0.65rem] font-semibold tracking-[0.22em] text-bankroll-gold uppercase sm:text-[0.7rem]">
              Vault preview
            </span>
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-bankroll-ruby opacity-70" />
              <span className="relative size-2 rounded-full bg-[#ff4d67]" />
            </span>
          </div>

          <div ref={titleRef}>
            <h2 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Gallery{' '}
              <span className="text-bankroll-green [text-shadow:0_0_28px_rgba(204,255,0,0.4)]">
                under development
              </span>
            </h2>
            <p className="mt-4 font-display text-lg text-white/65 italic sm:text-xl md:text-2xl">
              Frames are hanging. The outlaw shots drop soon.
            </p>
          </div>
        </div>

        <div
          ref={gridRef}
          className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-5 md:grid-cols-4 md:grid-rows-2 md:gap-5"
        >
          {frames.map((frame, i) => (
            <div
              key={frame.label}
              className={`group relative overflow-hidden rounded-2xl border border-bankroll-gold/30 bg-[#0a0608] ${frame.span} ${
                frame.tall ? 'min-h-[280px] sm:min-h-[320px] md:min-h-0' : 'min-h-[180px] sm:min-h-[200px]'
              }`}
            >
              {/* Ornate frame edge */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[6px] rounded-xl border border-white/5"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(176,16,48,0.35)_0%,transparent_65%)] opacity-80 transition duration-500 group-hover:opacity-100"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 10px)',
                }}
              />

              {/* Corner gems */}
              {[
                'top-3 left-3',
                'top-3 right-3',
                'bottom-3 left-3',
                'bottom-3 right-3',
              ].map((pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`absolute ${pos} size-2 rotate-45 bg-[#ff2d4a] shadow-[0_0_10px_rgba(255,45,74,0.7)]`}
                />
              ))}

              <div className="relative z-10 flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                <img
                  src={leaf}
                  alt=""
                  className="size-8 object-contain opacity-70 brightness-0 invert sm:size-9"
                  decoding="async"
                />
                <p className="font-sans text-[0.65rem] tracking-[0.22em] text-bankroll-gold/90 uppercase">
                  {frame.label}
                </p>
                <p className="font-display text-lg text-white/50 italic sm:text-xl">
                  Soon
                </p>
              </div>

              {/* Hover light */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-[120%]"
              />
            </div>
          ))}
        </div>

        <p className="mt-10 text-center font-sans text-xs tracking-[0.18em] text-white/40 uppercase sm:text-sm">
          $BANKROLL · media vault locked
        </p>
      </div>
    </section>
  )
}
