import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Phone } from 'lucide-react'
import heroDesktop from '../assets/desktopheroimage.png'
import heroMobile from '../assets/mobileheroimage.png'
import dialupPhone from '../assets/dailup.png'
import vintageRing from '../assets/Vintage.mp3'
import { usePhoneLiveStats } from '../hooks/usePhoneLiveStats'
import LivePhoneStats from './LivePhoneStats'

gsap.registerPlugin(ScrollTrigger)

/** Motion cubic-bezier (easeOut) */
const easeOut = [0, 0, 0.58, 1]

const CALL_HREF = 'tel:18002657655'
const BUY_HREF = '#buy'

const socials = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 sm:size-[1.1rem]" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: 'Telegram',
    href: 'https://t.me',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4 sm:size-[1.15rem]" fill="currentColor" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
]

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: easeOut, delay },
})

export default function Hero() {
  const sectionRef = useRef(null)
  const bgMobileRef = useRef(null)
  const bgDesktopRef = useRef(null)
  const [ringing, setRinging] = useState(false)
  const [floaters, setFloaters] = useState([])
  const audioRef = useRef(null)
  const floaterIdRef = useRef(0)
  const { ringCount, recordRing } = usePhoneLiveStats()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  useEffect(() => {
    const audio = new Audio(vintageRing)
    audio.preload = 'auto'
    audioRef.current = audio

    const onEnded = () => setRinging(false)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('ended', onEnded)
      audioRef.current = null
    }
  }, [])

  // GSAP scrub: background scales / drifts as you leave the hero
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const targets = [bgMobileRef.current, bgDesktopRef.current].filter(Boolean)
    if (!targets.length) return

    const ctx = gsap.context(() => {
      targets.forEach((el) => {
        gsap.to(el, {
          yPercent: 18,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const spawnFloater = () => {
    const id = ++floaterIdRef.current
    setFloaters((prev) => [...prev, { id }])
    window.setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id))
    }, 1000)
  }

  const handlePhoneClick = async (event) => {
    event.currentTarget.blur()
    if (ringing) return

    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setRinging(true)
    spawnFloater()
    void recordRing()

    try {
      await audio.play()
    } catch {
      setRinging(false)
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-svh w-full overflow-hidden bg-black"
      aria-label="Hero"
    >
      <LivePhoneStats
        ringCount={ringCount}
        floaters={floaters}
      />

      <motion.img
        ref={bgMobileRef}
        src={heroMobile}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center will-change-transform md:hidden"
        width={941}
        height={1672}
        decoding="async"
        fetchPriority="high"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: easeOut }}
      />

      <motion.img
        ref={bgDesktopRef}
        src={heroDesktop}
        alt=""
        className="absolute inset-0 hidden h-full w-full object-cover object-[center_28%] will-change-transform md:block"
        width={1672}
        height={941}
        decoding="async"
        fetchPriority="high"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: easeOut }}
      />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex min-h-svh flex-col px-5 pb-8 pt-20 will-change-transform sm:px-8 md:block md:px-14 md:pb-20 md:pt-24 lg:px-20"
      >
        <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center text-center md:absolute md:top-1/2 md:left-14 md:mx-0 md:max-w-2xl md:translate-y-[calc(-50%+30px)] md:items-start md:text-left lg:left-20">
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-[160%] w-[140%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.62)_38%,rgba(0,0,0,0.28)_62%,transparent_78%)] md:left-[35%] md:h-[170%] md:w-[150%] md:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.22)_64%,transparent_80%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-[45%] left-1/2 z-0 h-[95%] w-[105%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/45 blur-3xl md:left-[30%] md:bg-black/40"
          />

          <div className="relative z-10 flex w-full flex-col items-center md:items-start">
            <motion.p
              className="font-sans text-[0.65rem] font-semibold tracking-[0.28em] text-bankroll-gold uppercase sm:text-xs md:text-sm"
              {...fadeUp(0.12)}
            >
              Welcome to
            </motion.p>

            <motion.h1
              className="mt-1.5 font-display text-[2.4rem] leading-[0.92] font-bold tracking-tight min-[390px]:text-[2.75rem] sm:text-6xl md:mt-3 md:text-7xl lg:text-8xl"
              {...fadeUp(0.22)}
            >
              <span className="block text-white">1-800</span>
              <span className="mt-1 block text-bankroll-green [text-shadow:0_0_24px_rgba(204,255,0,0.3)]">
                $BANKROLL
              </span>
            </motion.h1>

            <motion.div className="mt-3 max-w-md sm:mt-4 md:mt-6" {...fadeUp(0.34)}>
              <p className="font-display text-[0.95rem] leading-snug text-white italic sm:text-xl md:text-2xl">
                The only hotline that can&apos;t help you...
              </p>
              <p className="mt-1 font-display text-[0.95rem] leading-snug text-bankroll-gold italic sm:text-xl md:text-2xl">
                But the chart can.
              </p>
            </motion.div>

            <motion.div
              className="mt-5 flex w-full flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 md:justify-start"
              {...fadeUp(0.46)}
            >
              <a
                href={CALL_HREF}
                className="btn-ruby-diamond px-5 py-3 font-sans text-sm sm:px-6 sm:py-3.5 sm:text-[0.95rem]"
              >
                <Phone className="btn-ruby-icon size-4 shrink-0 sm:size-[1.1rem]" strokeWidth={2.25} aria-hidden />
                Call 1-800-Bankroll
              </a>

              <a
                href={BUY_HREF}
                className="inline-flex items-center justify-center rounded-lg border border-bankroll-gold/90 bg-black/55 px-5 py-3 font-sans text-sm font-semibold tracking-wide text-white uppercase transition hover:bg-black/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bankroll-gold sm:px-6 sm:py-3.5 sm:text-[0.95rem]"
              >
                Buy $BANKROLL
              </a>
            </motion.div>

            <motion.div
              className="mt-5 flex items-center justify-center gap-3 sm:mt-7 sm:gap-3.5 md:justify-start"
              {...fadeUp(0.58)}
            >
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  className="flex size-10 items-center justify-center rounded-full border border-bankroll-gold/70 bg-black/60 text-bankroll-gold shadow-[0_0_16px_rgba(199,164,92,0.25)] transition hover:border-bankroll-gold hover:bg-black/80 hover:text-[#e8c87f] hover:shadow-[0_0_22px_rgba(199,164,92,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bankroll-gold sm:size-11"
                >
                  {item.icon}
                </a>
              ))}
            </motion.div>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handlePhoneClick}
          aria-label={ringing ? 'Phone ringing — wait for this tap to finish' : 'Ring the 1-800-BANKROLL phone'}
          aria-busy={ringing}
          disabled={ringing}
          className={`relative z-20 mt-[77px] w-[88%] max-w-[300px] self-center border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none min-[390px]:max-w-[340px] sm:mt-16 sm:w-[70%] sm:max-w-[400px] md:absolute md:right-[6%] md:bottom-[5%] md:mt-0 md:w-[54%] md:max-w-[820px] md:self-auto lg:right-[10%] lg:w-[50%] xl:right-[12%] xl:max-w-[920px] ${ringing ? 'cursor-wait' : 'cursor-pointer'}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: easeOut, delay: 0.35 }}
        >
          <img
            src={dialupPhone}
            alt=""
            className={`h-auto w-full drop-shadow-[0_24px_50px_rgba(0,0,0,0.65)] [mix-blend-mode:lighten] ${ringing ? 'phone-ringing' : ''}`}
            width={1364}
            height={819}
            decoding="async"
            draggable={false}
          />
        </motion.button>
      </motion.div>
    </section>
  )
}
