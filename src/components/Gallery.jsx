import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
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

const ease = [0.22, 1, 0.36, 1]

export default function Gallery() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const stageRef = useRef(null)
  const stripRef = useRef(null)
  const frameRef = useRef(null)
  const imageWrapRef = useRef(null)
  const progressRef = useRef(null)
  const kenBurnsRef = useRef(null)
  const pointerRef = useRef({ x: 0, dragging: false })
  const swipedRef = useRef(false)
  const dirRef = useRef(1)
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const shot = shots[active]

  const goTo = useCallback((index, direction = 1) => {
    dirRef.current = direction
    setActive(((index % shots.length) + shots.length) % shots.length)
  }, [])

  const go = useCallback(
    (delta) => {
      dirRef.current = delta
      setActive((i) => (i + delta + shots.length) % shots.length)
    },
    [],
  )

  const prev = useCallback(() => go(-1), [go])
  const next = useCallback(() => go(1), [go])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

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

  // Scroll entrance
  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const thumbs = stripRef.current?.querySelectorAll('[data-thumb]') ?? []

      gsap.set([headerRef.current, stageRef.current], { y: 36, opacity: 0 })
      gsap.set(thumbs, { y: 28, opacity: 0, scale: 0.96 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          once: true,
        },
      })

      tl.to(headerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
      })
        .to(
          stageRef.current,
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
          '-=0.55',
        )
        .to(
          thumbs,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power3.out',
          },
          '-=0.55',
        )
    }, section)

    return () => ctx.revert()
  }, [])

  // Stage transition + ken burns + progress
  useLayoutEffect(() => {
    const wrap = imageWrapRef.current
    const frame = frameRef.current
    if (!wrap || !frame) return

    const dir = dirRef.current
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (kenBurnsRef.current) {
      kenBurnsRef.current.kill()
      kenBurnsRef.current = null
    }

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(wrap, { opacity: 1, x: 0, scale: 1, filter: 'none' })
      } else {
        gsap.fromTo(
          wrap,
          {
            opacity: 0,
            x: dir * 36,
            scale: 1.04,
            filter: 'blur(6px)',
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            ease: 'power3.out',
          },
        )

        gsap.fromTo(
          frame,
          { boxShadow: '0 0 0 rgba(0,200,5,0)' },
          {
            boxShadow: '0 0 48px rgba(0,200,5,0.12)',
            duration: 0.55,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
          },
        )

        kenBurnsRef.current = gsap.to(wrap, {
          scale: 1.035,
          duration: 8,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 0.75,
        })
      }

      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: (active + 1) / shots.length,
          duration: prefersReduced ? 0 : 0.55,
          ease: 'power3.out',
        })
      }
    }, frame)

    return () => {
      if (kenBurnsRef.current) {
        kenBurnsRef.current.kill()
        kenBurnsRef.current = null
      }
      ctx.revert()
    }
  }, [active])

  // Keep active thumb in view within the strip only (never scroll the page)
  useEffect(() => {
    const strip = stripRef.current
    const el = strip?.querySelector(`[data-thumb="${active}"]`)
    if (!strip || !el) return

    const target =
      el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2
    strip.scrollTo({
      left: Math.max(0, target),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [active, reducedMotion])

  const onPointerDown = (e) => {
    pointerRef.current = { x: e.clientX, dragging: true }
    swipedRef.current = false
  }

  const onPointerUp = (e) => {
    if (!pointerRef.current.dragging) return
    const dx = e.clientX - pointerRef.current.x
    pointerRef.current.dragging = false
    if (Math.abs(dx) < 56) return
    swipedRef.current = true
    if (dx > 0) prev()
    else next()
  }

  const openLightbox = () => {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    setLightbox(true)
  }

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
        className="pointer-events-none absolute top-1/2 left-1/2 h-[70%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,200,5,0.08)_0%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="vault-grain pointer-events-none absolute inset-0 opacity-[0.035]"
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
              Hotline <span className="text-bankroll-green">stills</span>
            </h2>
            <p className="mt-3 max-w-md font-display text-lg text-white/55 italic sm:text-xl">
              Scenes from the line. Tap a frame to step through the vault.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="font-mono text-sm tracking-widest text-bankroll-gold/80 tabular-nums">
              {shot.id}
              <span className="text-white/30">
                {' '}
                / {String(shots.length).padStart(2, '0')}
              </span>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous still"
                className="flex size-10 items-center justify-center rounded-full border border-bankroll-gold/35 bg-black/40 text-bankroll-gold transition duration-300 hover:border-bankroll-gold hover:bg-black/70 hover:shadow-[0_0_20px_rgba(232,200,127,0.2)] active:scale-95"
              >
                <ChevronLeft className="size-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next still"
                className="flex size-10 items-center justify-center rounded-full border border-bankroll-gold/35 bg-black/40 text-bankroll-gold transition duration-300 hover:border-bankroll-gold hover:bg-black/70 hover:shadow-[0_0_20px_rgba(232,200,127,0.2)] active:scale-95"
              >
                <ChevronRight className="size-5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div ref={stageRef} className="mt-10 sm:mt-12">
          <div
            ref={frameRef}
            className="relative overflow-hidden rounded-sm border border-bankroll-gold/25 bg-black/60 transition-[border-color] duration-500 hover:border-bankroll-gold/50"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-[#e8c87f]/50 to-transparent"
            />
            <div
              aria-hidden
              className="vault-sheen pointer-events-none absolute inset-0 z-10 opacity-40"
            />

            <button
              type="button"
              onClick={openLightbox}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => {
                pointerRef.current.dragging = false
              }}
              aria-label="Open still full screen"
              className="group relative block w-full touch-pan-y text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bankroll-gold"
            >
              <div className="relative flex max-h-[min(62vh,640px)] items-center justify-center px-3 py-4 sm:px-5 sm:py-5">
                <div
                  ref={imageWrapRef}
                  key={shot.id}
                  className="will-change-transform"
                >
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="max-h-[min(58vh,600px)] w-auto max-w-full object-contain select-none"
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              </div>

              <span className="pointer-events-none absolute right-3 bottom-3 z-20 inline-flex items-center gap-1.5 font-sans text-[0.6rem] tracking-[0.2em] text-white/45 uppercase opacity-0 transition duration-400 group-hover:opacity-100 sm:right-4 sm:bottom-4">
                <Maximize2 className="size-3" strokeWidth={1.75} />
                Expand
              </span>
            </button>

            {/* Progress rail */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[2px] bg-white/5"
            >
              <div
                ref={progressRef}
                className="h-full origin-left bg-gradient-to-r from-bankroll-green via-[#e8c87f] to-bankroll-gold"
                style={{ transform: `scaleX(${(active + 1) / shots.length})` }}
              />
            </div>
          </div>

          {/* Soft caption */}
          <p className="mt-4 truncate text-center font-sans text-xs tracking-wide text-white/35 sm:text-sm">
            {shot.alt}
          </p>
        </div>

        {/* Thumbnail strip */}
        <div
          ref={stripRef}
          className="mt-5 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:mt-6 sm:gap-4 [&::-webkit-scrollbar]:hidden"
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
                data-thumb={i}
                aria-selected={selected}
                onClick={() => goTo(i, i > active ? 1 : -1)}
                className={`group/thumb relative w-[28%] min-w-[7.5rem] shrink-0 overflow-hidden rounded-sm border bg-black/50 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[22%] sm:min-w-0 ${
                  selected
                    ? 'border-bankroll-green shadow-[0_0_28px_rgba(0,200,5,0.28)]'
                    : 'border-white/10 hover:border-bankroll-gold/40'
                }`}
              >
                <img
                  src={item.src}
                  alt=""
                  className={`aspect-[4/3] h-auto w-full object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    selected
                      ? 'scale-105 opacity-100'
                      : 'opacity-50 group-hover/thumb:scale-[1.03] group-hover/thumb:opacity-85'
                  }`}
                  loading="lazy"
                  decoding="async"
                />
                <span
                  className={`absolute top-2 left-2 font-mono text-[0.6rem] tracking-widest transition duration-300 ${
                    selected ? 'text-bankroll-green' : 'text-white/45'
                  }`}
                >
                  {item.id}
                </span>
                {selected && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-bankroll-green"
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/93 p-4 backdrop-blur-md sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={shot.alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease }}
            onClick={() => setLightbox(false)}
          >
            <motion.button
              type="button"
              aria-label="Close"
              className="absolute top-4 right-4 z-10 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-bankroll-gold hover:text-bankroll-gold sm:top-6 sm:right-6"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease, delay: 0.05 }}
              onClick={() => setLightbox(false)}
            >
              <X className="size-5" strokeWidth={1.75} />
            </motion.button>

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

            <AnimatePresence mode="wait" custom={dirRef.current}>
              <motion.img
                key={shot.id}
                src={shot.src}
                alt={shot.alt}
                custom={dirRef.current}
                initial={{ opacity: 0, x: dirRef.current * 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: dirRef.current * -28, scale: 0.98 }}
                transition={{ duration: 0.45, ease }}
                className="max-h-[88vh] max-w-[min(96vw,1100px)] object-contain"
                onClick={(e) => e.stopPropagation()}
                decoding="async"
                draggable={false}
              />
            </AnimatePresence>

            <motion.p
              key={`cap-${shot.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease, delay: 0.08 }}
              className="pointer-events-none absolute bottom-5 left-1/2 max-w-lg -translate-x-1/2 px-4 text-center font-sans text-xs tracking-wide text-white/45 sm:bottom-8 sm:text-sm"
            >
              {shot.alt}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
