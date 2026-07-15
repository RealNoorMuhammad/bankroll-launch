import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import meme1 from '../assets/memes/112 (1).png'
import meme2 from '../assets/memes/112 (2).png'
import meme3 from '../assets/memes/112 (3).png'
import meme4 from '../assets/memes/112 (4).png'

gsap.registerPlugin(ScrollTrigger)

const shots = [
  {
    id: '01',
    src: meme3,
    alt: 'Outlaw on the line during a storm call — 1-800 BANKROLL',
  },
  {
    id: '02',
    src: meme4,
    alt: 'Vacant hotline desk in the Bankroll call floor',
  },
  {
    id: '03',
    src: meme2,
    alt: 'Finger on the dial of the ruby 1-800 BANKROLL phone',
  },
  {
    id: '04',
    src: meme1,
    alt: 'Four steps comic — ring, pick up, no help, chart goes green',
  },
]

export default function Gallery() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const stageRef = useRef(null)
  const stripRef = useRef(null)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const shot = shots[active]

  const go = useCallback((delta) => {
    setActive((i) => (i + delta + shots.length) % shots.length)
  }, [])

  const prev = useCallback(() => go(-1), [go])
  const next = useCallback(() => go(1), [go])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox, go])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.set([headerRef.current, stageRef.current, stripRef.current], {
        y: 40,
        opacity: 0,
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true,
        },
      })

      tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.75, ease: 'power3.out' })
        .to(stageRef.current, { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, '-=0.45')
        .to(stripRef.current, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.5')
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
          'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(176,16,48,0.22) 0%, transparent 55%), linear-gradient(180deg, #070504 0%, #0d0608 45%, #050303 100%)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-[#e8c87f]/75 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-[#e8c87f]/75 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(35,87,1,0.08)_0%,transparent_70%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <div
          ref={headerRef}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="font-sans text-[0.65rem] font-semibold tracking-[0.28em] text-bankroll-gold uppercase sm:text-xs">
              Media vault
            </p>
            <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Hotline{' '}
              <span className="text-bankroll-green">stills</span>
            </h2>
            <p className="mt-3 max-w-md font-display text-lg text-white/55 italic sm:text-xl">
              Scenes from the line. Tap a frame to step through the vault.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="font-mono text-sm tracking-widest text-bankroll-gold/80">
              {shot.id}
              <span className="text-white/30"> / {String(shots.length).padStart(2, '0')}</span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous still"
                className="flex size-10 items-center justify-center rounded-full border border-bankroll-gold/35 bg-black/40 text-bankroll-gold transition hover:border-bankroll-gold hover:bg-black/70"
              >
                <ChevronLeft className="size-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next still"
                className="flex size-10 items-center justify-center rounded-full border border-bankroll-gold/35 bg-black/40 text-bankroll-gold transition hover:border-bankroll-gold hover:bg-black/70"
              >
                <ChevronRight className="size-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div ref={stageRef} className="mt-10 sm:mt-12">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Open still full screen"
            className="group relative block w-full overflow-hidden rounded-sm border border-bankroll-gold/25 bg-black/60 text-left outline-none transition hover:border-bankroll-gold/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bankroll-gold"
          >
            <div className="flex max-h-[min(62vh,640px)] items-center justify-center px-3 py-4 sm:px-5 sm:py-5">
              <img
                key={shot.id}
                src={shot.src}
                alt={shot.alt}
                className="max-h-[min(58vh,600px)] w-auto max-w-full object-contain transition duration-500 group-hover:scale-[1.015]"
                loading="eager"
                decoding="async"
              />
            </div>
            <span className="pointer-events-none absolute right-3 bottom-3 font-sans text-[0.6rem] tracking-[0.2em] text-white/40 uppercase opacity-0 transition group-hover:opacity-100 sm:right-4 sm:bottom-4">
              Expand
            </span>
          </button>
        </div>

        {/* Thumbnail strip */}
        <div
          ref={stripRef}
          className="mt-5 flex gap-3 overflow-x-auto pb-1 sm:mt-6 sm:gap-4"
          role="listbox"
          aria-label="Vault stills"
        >
          {shots.map((item, i) => {
            const selected = i === active
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => setActive(i)}
                className={`relative w-[28%] min-w-[7.5rem] shrink-0 overflow-hidden rounded-sm border bg-black/50 transition sm:w-[22%] sm:min-w-0 ${
                  selected
                    ? 'border-bankroll-green shadow-[0_0_24px_rgba(35,87,1,0.35)]'
                    : 'border-white/10 hover:border-bankroll-gold/40'
                }`}
              >
                <img
                  src={item.src}
                  alt=""
                  className={`aspect-[4/3] h-auto w-full object-cover transition duration-500 ${
                    selected ? 'opacity-100' : 'opacity-55 hover:opacity-85'
                  }`}
                  loading="lazy"
                  decoding="async"
                />
                <span
                  className={`absolute top-2 left-2 font-mono text-[0.6rem] tracking-widest ${
                    selected ? 'text-bankroll-green' : 'text-white/50'
                  }`}
                >
                  {item.id}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={shot.alt}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-bankroll-gold hover:text-bankroll-gold sm:top-6 sm:right-6"
            onClick={() => setLightbox(false)}
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            aria-label="Previous still"
            className="absolute top-1/2 left-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-bankroll-gold transition hover:border-bankroll-gold sm:left-6"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
          >
            <ChevronLeft className="size-6" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            aria-label="Next still"
            className="absolute top-1/2 right-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-bankroll-gold transition hover:border-bankroll-gold sm:right-6"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
          >
            <ChevronRight className="size-6" strokeWidth={1.75} />
          </button>

          <img
            src={shot.src}
            alt={shot.alt}
            className="max-h-[88vh] max-w-[min(96vw,1100px)] object-contain"
            onClick={(e) => e.stopPropagation()}
            decoding="async"
          />
        </div>
      )}
    </section>
  )
}
