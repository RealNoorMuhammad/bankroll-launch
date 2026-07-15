import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { Menu, X } from 'lucide-react'
import { scrollToHash } from '../lib/scrollToHash'

const BUY_TO = { pathname: '/', hash: 'buy' }

const navLinks = [
  { label: 'Home', to: '/', type: 'route' },
  { label: 'How to buy', to: { pathname: '/', hash: 'howtobuy' }, type: 'hash' },
  { label: 'PFP', to: '/pfp', type: 'route' },
  { label: 'Dashboard', to: '/dashboard', type: 'route' },
]

function BrandMark() {
  return (
    <span className="font-display text-[1.05rem] font-bold tracking-tight text-white sm:text-[1.2rem]">
      $BANKROLL
    </span>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const headerRef = useRef(null)
  const pillRef = useRef(null)
  const brandRef = useRef(null)
  const linksRef = useRef(null)
  const ctaRef = useRef(null)
  const menuRef = useRef(null)
  const menuItemsRef = useRef([])
  const lineTopRef = useRef(null)
  const lineMidRef = useRef(null)
  const lineBotRef = useRef(null)
  const scrollTween = useRef(null)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.hash])

  const closeMenu = () => setOpen(false)

  const linkClass =
    'group relative inline-block font-sans text-sm font-medium tracking-[0.14em] text-white/80 uppercase outline-none transition-colors hover:text-white focus-visible:text-white after:pointer-events-none after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100'

  const mobileLinkClass =
    'border-b border-white/10 py-4 font-display text-4xl font-bold tracking-tight text-white transition hover:text-white'

  const goHash = (hashId) => {
    closeMenu()
    if (location.pathname === '/') {
      if (location.hash !== `#${hashId}`) {
        navigate({ pathname: '/', hash: hashId }, { replace: false })
      }
      // Same-page: ensure scroll even if hash is unchanged
      requestAnimationFrame(() => scrollToHash(hashId))
      return
    }
    navigate({ pathname: '/', hash: hashId })
  }

  const renderLink = (link, className, extra = {}) => {
    if (link.type === 'hash') {
      const hashId = typeof link.to === 'object' ? link.to.hash : String(link.to).split('#')[1]
      return (
        <Link
          key={link.label}
          to={link.to}
          className={className}
          onClick={(e) => {
            e.preventDefault()
            goHash(hashId)
          }}
          {...extra}
        >
          {link.label}
        </Link>
      )
    }

    return (
      <Link
        key={link.label}
        to={link.to}
        className={className}
        onClick={closeMenu}
        {...extra}
      >
        {link.label}
      </Link>
    )
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      gsap.set(headerRef.current, { y: -28, opacity: 0 })
      gsap.set([brandRef.current, ctaRef.current], { y: -12, opacity: 0 })
      if (linksRef.current) {
        gsap.set(linksRef.current.children, { y: -10, opacity: 0 })
      }

      tl.to(headerRef.current, { y: 0, opacity: 1, duration: 0.7 })
        .to(brandRef.current, { y: 0, opacity: 1, duration: 0.55 }, '-=0.4')
        .to(
          linksRef.current?.children || [],
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.07 },
          '-=0.35',
        )
        .to(ctaRef.current, { y: 0, opacity: 1, duration: 0.5 }, '-=0.25')
    }, headerRef)

    return () => ctx.revert()
  }, [])

  // Desktop: morph full bar → floating pill on scroll
  useEffect(() => {
    const pill = pillRef.current
    if (!pill) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      scrollTween.current?.kill()

      if (scrolled) {
        scrollTween.current = gsap.to(pill, {
          width: 'min(920px, calc(100% - 3rem))',
          maxWidth: '920px',
          borderRadius: 9999,
          paddingLeft: 20,
          paddingRight: 20,
          marginTop: 14,
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderColor: 'rgba(199,164,92,0.4)',
          boxShadow:
            '0 20px 55px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,200,5,0.08), inset 0 1px 0 rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          duration: 0.7,
          ease: 'power3.out',
        })
      } else {
        scrollTween.current = gsap.to(pill, {
          width: '100%',
          maxWidth: '100%',
          borderRadius: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginTop: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: 'rgba(0,0,0,0)',
          borderColor: 'rgba(199,164,92,0)',
          boxShadow: '0 0 0 rgba(0,0,0,0)',
          backdropFilter: 'blur(0px)',
          duration: 0.55,
          ease: 'power3.inOut',
        })
      }
    })

    mm.add('(max-width: 767px)', () => {
      scrollTween.current?.kill()
      gsap.set(pill, {
        clearProps: 'width,maxWidth,borderRadius,paddingLeft,paddingRight,marginTop,backgroundColor,borderColor,boxShadow,backdropFilter',
      })
    })

    return () => {
      scrollTween.current?.kill()
      mm.revert()
    }
  }, [scrolled])

  useEffect(() => {
    if (!menuRef.current) return

    const items = menuItemsRef.current.filter(Boolean)

    if (open) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      gsap.set(menuRef.current, { display: 'flex' })
      tl.fromTo(
        menuRef.current,
        { opacity: 0, clipPath: 'inset(0 0 100% 0)' },
        { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.55 },
      ).fromTo(
        items,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.08 },
        '-=0.25',
      )

      gsap.to(lineTopRef.current, { y: 7, rotate: 45, duration: 0.3, ease: 'power2.out' })
      gsap.to(lineMidRef.current, { opacity: 0, duration: 0.2 })
      gsap.to(lineBotRef.current, { y: -7, rotate: -45, duration: 0.3, ease: 'power2.out' })
    } else {
      gsap.to(lineTopRef.current, { y: 0, rotate: 0, duration: 0.28, ease: 'power2.out' })
      gsap.to(lineMidRef.current, { opacity: 1, duration: 0.2 })
      gsap.to(lineBotRef.current, { y: 0, rotate: 0, duration: 0.28, ease: 'power2.out' })

      gsap.to(menuRef.current, {
        opacity: 0,
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          if (menuRef.current) menuRef.current.style.display = 'none'
        },
      })
    }
  }, [open])

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 flex justify-center ${
          open ? 'bg-black md:bg-transparent' : ''
        } ${
          !scrolled && !open
            ? 'bg-gradient-to-b from-black/55 via-black/20 to-transparent'
            : ''
        } ${scrolled && !open ? 'bg-black md:bg-transparent' : ''}`}
      >
        <div
          ref={pillRef}
          className="w-full border border-transparent md:mx-auto"
          style={{ willChange: 'width, border-radius, box-shadow, background-color' }}
        >
          <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-[4.25rem] sm:px-6 md:px-8 lg:px-10">
            <Link
              ref={brandRef}
              to="/"
              className="relative z-[60] flex items-center"
              aria-label="1-800-BANKROLL home"
              onClick={closeMenu}
            >
              <BrandMark />
            </Link>

            <div ref={linksRef} className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => renderLink(link, linkClass))}
            </div>

            <div ref={ctaRef} className="hidden items-center gap-3 md:flex">
              <Link
                to={BUY_TO}
                onClick={(e) => {
                  e.preventDefault()
                  goHash('buy')
                }}
                className="bankroll-green-shine inline-flex items-center rounded-full px-4 py-2 font-sans text-xs font-bold tracking-wide uppercase transition"
              >
                Buy $BANKROLL
              </Link>
            </div>

            <button
              type="button"
              className="relative z-[60] flex size-11 items-center justify-center rounded-lg border border-bankroll-gold/30 bg-black/40 text-white md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative flex h-[14px] w-[18px] flex-col justify-between">
                <span ref={lineTopRef} className="h-[2px] w-full origin-center rounded-full bg-bankroll-green" />
                <span ref={lineMidRef} className="h-[2px] w-full rounded-full bg-white" />
                <span ref={lineBotRef} className="h-[2px] w-full origin-center rounded-full bg-bankroll-gold" />
              </span>
              <span className="sr-only">{open ? 'Close' : 'Menu'}</span>
              <span className="pointer-events-none absolute opacity-0">
                {open ? <X /> : <Menu />}
              </span>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        ref={menuRef}
        className="fixed inset-0 z-40 hidden flex-col bg-black/95 backdrop-blur-2xl md:hidden"
        style={{ display: 'none' }}
      >
        <div className="flex flex-1 flex-col justify-center gap-2 px-6 pt-20 pb-10">
          {navLinks.map((link, i) =>
            renderLink(link, mobileLinkClass, {
              ref: (el) => {
                menuItemsRef.current[i] = el
              },
            }),
          )}

          <Link
            to={BUY_TO}
            ref={(el) => {
              menuItemsRef.current[navLinks.length] = el
            }}
            onClick={(e) => {
              e.preventDefault()
              goHash('buy')
            }}
            className="bankroll-green-shine mt-8 inline-flex items-center justify-center rounded-xl px-6 py-4 font-sans text-sm font-bold tracking-[0.16em] uppercase"
          >
            Buy $BANKROLL
          </Link>
        </div>

        <p className="px-6 pb-8 text-center font-sans text-xs tracking-[0.2em] text-white/40 uppercase">
          No help. Just profits.
        </p>
      </div>
    </>
  )
}
