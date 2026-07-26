import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  Download,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import Footer from '../components/Footer'
import { getFal, isFalConfigured } from '../lib/fal'
import { PFP_IMAGE_TO_IMAGE_PROMPT } from '../lib/pfpPrompt'
import hatRef from '../assets/pfphat/hat.webp'
import studioHero from '../assets/pfp/pfp-studio-hero.png'
import leaf from '../assets/leaf.png'

const MARQUEE_ITEMS = [
  { text: '1-800-BANKROLL', accent: true },
  { text: 'Outlaw PFP' },
  { text: 'Hat locked.', accent: true },
  { text: 'Hotline ready' },
  { text: '$BANKROLL', accent: true },
  { text: 'Cinematic frame' },
  { text: 'Dial in. Stand out.', accent: true },
]

function MarqueeLeaf() {
  return (
    <img
      src={leaf}
      alt=""
      aria-hidden
      decoding="async"
      className="h-3 w-auto shrink-0 object-contain sm:h-3.5"
      style={{
        filter:
          'brightness(0) saturate(100%) invert(58%) sepia(96%) saturate(1800%) hue-rotate(73deg) brightness(1.05)',
      }}
    />
  )
}

function GoldRule() {
  return (
    <div className="relative mx-auto flex h-px w-full max-w-5xl items-center px-5 sm:px-8" aria-hidden>
      <div
        className="h-px flex-1"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(199,164,92,0.15) 18%, rgba(232,200,127,0.75) 50%, rgba(199,164,92,0.15) 82%, transparent 100%)',
        }}
      />
      <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-bankroll-ruby shadow-[0_0_12px_rgba(176,16,48,0.55)]" />
    </div>
  )
}

const STATUS = {
  idle: 'idle',
  uploading: 'uploading',
  generating: 'generating',
  done: 'done',
  error: 'error',
}

const easeOut = [0, 0, 0.58, 1]

/** Cache Fal upload URL for the bundled hat reference (session-scoped). */
let cachedHatUploadUrl = ''

async function uploadHatReference(client) {
  if (cachedHatUploadUrl) return cachedHatUploadUrl

  const response = await fetch(hatRef)
  if (!response.ok) {
    throw new Error('Could not load Robin Hood hat reference.')
  }
  const blob = await response.blob()
  const hatFile = new File([blob], 'robin-hood-hat.webp', {
    type: blob.type || 'image/webp',
  })
  cachedHatUploadUrl = await client.storage.upload(hatFile)
  return cachedHatUploadUrl
}

export default function PfpPage() {
  const inputRef = useRef(null)
  const studioRef = useRef(null)
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [status, setStatus] = useState(STATUS.idle)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const resetResult = () => {
    setResultUrl('')
    setError('')
    setProgress('')
    setStatus(STATUS.idle)
  }

  const downloadToDevice = async () => {
    if (!resultUrl || downloading) return

    try {
      setDownloading(true)
      setError('')
      const response = await fetch(resultUrl)
      if (!response.ok) throw new Error('Could not fetch the image for download.')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = 'bankroll-pfp.png'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Download failed. Try again.')
    } finally {
      setDownloading(false)
    }
  }

  const clearUpload = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl('')
    resetResult()
    if (inputRef.current) inputRef.current.value = ''
  }

  const acceptFile = useCallback((next) => {
    if (!next || !next.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP).')
      setStatus(STATUS.error)
      return
    }
    if (next.size > 10 * 1024 * 1024) {
      setError('Keep uploads under 10MB.')
      setStatus(STATUS.error)
      return
    }

    setError('')
    setResultUrl('')
    setStatus(STATUS.idle)
    setFile(next)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(next)
    })
  }, [])

  const onDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    const dropped = event.dataTransfer.files?.[0]
    if (dropped) acceptFile(dropped)
  }

  const scrollToStudio = () => {
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const generate = async () => {
    if (!file) {
      setError('Upload a profile image first.')
      setStatus(STATUS.error)
      return
    }
    if (!isFalConfigured) {
      setError('Add VITE_FAL_KEY to your .env file, then restart the dev server.')
      setStatus(STATUS.error)
      return
    }

    try {
      setError('')
      setResultUrl('')
      setStatus(STATUS.uploading)
      setProgress('Uploading your PFP + hat reference to Fal…')

      const client = getFal()
      const [imageUrl, hatUrl] = await Promise.all([
        client.storage.upload(file),
        uploadHatReference(client),
      ])

      setStatus(STATUS.generating)
      setProgress('Dialing the vault… transforming your outlaw PFP…')

      const result = await client.subscribe('fal-ai/nano-banana-pro/edit', {
        input: {
          image_urls: [imageUrl, hatUrl],
          prompt: PFP_IMAGE_TO_IMAGE_PROMPT,
          aspect_ratio: '16:9',
          resolution: '2K',
          num_images: 1,
          output_format: 'png',
          safety_tolerance: '4',
          limit_generations: true,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_QUEUE') {
            setProgress('In queue — the line is busy…')
          }
          if (update.status === 'IN_PROGRESS') {
            setProgress('Rendering cinematic 1-800-BANKROLL scene…')
          }
        },
      })

      const images = result?.data?.images ?? result?.images
      const outputUrl = images?.[0]?.url
      if (!outputUrl) {
        console.error('Unexpected Fal response', result)
        throw new Error('No image returned from Fal. Try again.')
      }

      if (outputUrl === imageUrl || outputUrl === hatUrl) {
        throw new Error('Fal returned the original upload unchanged. Try regenerate.')
      }

      setResultUrl(outputUrl)
      setStatus(STATUS.done)
      setProgress('Ready — welcome to the hotline.')
    } catch (err) {
      console.error(err)
      setStatus(STATUS.error)
      setProgress('')
      setError(err?.message || 'Generation failed. Check your Fal key and try again.')
    }
  }

  const busy = status === STATUS.uploading || status === STATUS.generating

  return (
    <>
      {/* Hero — one composition, brand first, full-bleed atmosphere */}
      <section className="relative isolate flex min-h-[58svh] items-end overflow-hidden sm:min-h-[78svh] md:min-h-[100svh]">
        <motion.img
          src={studioHero}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-[center_28%] sm:object-[center_35%]"
          initial={{ scale: 1.08, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: easeOut }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/20"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,transparent_20%,rgba(5,5,5,0.75)_100%)]"
        />
        <div aria-hidden className="vault-grain pointer-events-none absolute inset-0 opacity-[0.12]" />
        <div aria-hidden className="vault-sheen pointer-events-none absolute inset-0" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-8 pt-20 sm:px-8 sm:pb-16 sm:pt-28 md:pb-20 md:pt-32">
          <motion.p
            className="font-display text-4xl font-bold tracking-[0.08em] text-white sm:text-6xl md:text-7xl lg:text-8xl"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: easeOut, delay: 0.15 }}
          >
            BANKROLL
          </motion.p>

          <motion.h1
            className="mt-2 max-w-xl font-display text-xl font-semibold tracking-tight text-bankroll-gold sm:mt-3 sm:text-3xl md:text-4xl"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: easeOut, delay: 0.35 }}
          >
            Cinematic outlaw portraits, dialed in.
          </motion.h1>

          <motion.p
            className="mt-3 max-w-md font-sans text-sm leading-relaxed text-white/65 sm:mt-4 sm:text-base"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.5 }}
          >
            Upload any avatar. We lock your character, crown the Robin Hood hat, and put them on the hotline.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-col items-stretch gap-2 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: easeOut, delay: 0.65 }}
          >
            <button
              type="button"
              onClick={scrollToStudio}
              className="btn-ruby-diamond px-6 py-3.5 font-sans text-sm"
            >
              <Sparkles className="btn-ruby-icon size-4" />
              Enter the studio
            </button>
            <Link
              to="/"
              className="px-4 py-2.5 text-center font-sans text-xs font-semibold tracking-[0.18em] text-white/55 uppercase transition hover:text-bankroll-gold sm:py-3"
            >
              Back to hotline
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Divider + marquee bridge */}
      <section
        aria-label="Bankroll PFP ticker"
        className="relative overflow-hidden bg-[#050505]"
      >
        <GoldRule />

        <div className="relative py-3 sm:py-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(176,16,48,0.14)_0%,transparent_65%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#050505] to-transparent sm:w-24"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#050505] to-transparent sm:w-24"
          />

          <div className="marquee-row relative">
            <div className="marquee-track flex w-max items-center gap-6 sm:gap-8 md:gap-10">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span
                  key={`${item.text}-${i}`}
                  className="flex items-center gap-6 sm:gap-8 md:gap-10"
                >
                  <span
                    className={`whitespace-nowrap font-display text-[1.45rem] leading-none font-bold tracking-tight uppercase sm:text-[1.75rem] md:text-[1.95rem] ${
                      item.accent ? 'text-bankroll-green' : 'text-white/90'
                    }`}
                  >
                    {item.text}
                  </span>
                  <MarqueeLeaf />
                </span>
              ))}
            </div>
          </div>
        </div>

        <GoldRule />
      </section>

      {/* Studio — interaction surface */}
      <section
        ref={studioRef}
        id="studio"
        className="relative isolate overflow-hidden px-5 py-10 sm:px-8 sm:py-24"
        style={{
          background:
            'linear-gradient(180deg, #050505 0%, #0c0306 42%, #050505 100%)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(176,16,48,0.22)_0%,transparent_48%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-bankroll-green/5 blur-3xl"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mb-8 flex flex-col gap-2 sm:mb-14 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div>
              <p className="font-sans text-[0.65rem] font-semibold tracking-[0.28em] text-bankroll-gold uppercase">
                PFP atelier
              </p>
              <h2 className="mt-1.5 font-display text-3xl font-bold text-white sm:mt-2 sm:text-4xl md:text-5xl">
                Drop in. Dial out.
              </h2>
            </div>
            <p className="max-w-sm font-sans text-sm leading-relaxed text-white/45">
              One upload. One 16:9 cinematic frame. Your character stays yours — hat and hotline do the rest.
            </p>
          </div>

          {!isFalConfigured && (
            <div className="mb-8 border border-[#ff4d67]/35 bg-[#2b0812]/70 px-4 py-3 text-center font-sans text-sm text-[#ffb3be]">
              Add <code className="text-bankroll-green">VITE_FAL_KEY</code> to your{' '}
              <code className="text-bankroll-gold">.env</code> and restart the server to enable generation.
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-start">
            {/* Upload — interaction container */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease: easeOut }}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <p className="font-sans text-[0.65rem] tracking-[0.22em] text-bankroll-gold uppercase">
                  01 · Source
                </p>
                <span className="font-sans text-[0.65rem] tracking-wide text-white/35 uppercase">
                  PNG · JPG · WEBP
                </span>
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`group relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center overflow-hidden border transition duration-300 sm:min-h-[360px] ${
                  dragOver
                    ? 'border-bankroll-green bg-bankroll-green/[0.06]'
                    : 'border-white/15 bg-black/40 hover:border-bankroll-gold/45'
                }`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(199,164,92,0.08) 0%, transparent 42%, rgba(176,16,48,0.1) 100%)',
                  }}
                />
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const next = e.target.files?.[0]
                    if (next) acceptFile(next)
                  }}
                />

                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Upload preview"
                      className="absolute inset-0 h-full w-full object-contain p-6"
                    />
                    <button
                      type="button"
                      className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center border border-white/20 bg-black/75 text-white transition hover:border-bankroll-gold/50 hover:text-bankroll-gold"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearUpload()
                      }}
                      aria-label="Remove image"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : (
                  <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                    <div className="flex size-16 items-center justify-center border border-bankroll-gold/35 bg-black/50 transition group-hover:border-bankroll-gold/70">
                      <ImagePlus className="size-6 text-bankroll-gold" />
                    </div>
                    <p className="font-display text-2xl text-white">Drop your PFP</p>
                    <p className="font-sans text-sm text-white/45">
                      or click to browse · up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!file || busy}
                onClick={generate}
                className="btn-ruby-diamond mt-5 w-full px-5 py-3.5 font-sans text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {status === STATUS.uploading ? 'Uploading…' : 'Generating…'}
                  </>
                ) : (
                  <>
                    <Sparkles className="btn-ruby-icon size-4" />
                    Generate 1-800-BANKROLL PFP
                  </>
                )}
              </button>

              {progress && (
                <p className="mt-3 text-center font-sans text-xs tracking-wide text-white/55">
                  {progress}
                </p>
              )}
              {error && (
                <p className="mt-3 text-center font-sans text-xs text-[#ff8a9a]">{error}</p>
              )}
            </motion.div>

            {/* Result — interaction container */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.12 }}
            >
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <p className="font-sans text-[0.65rem] tracking-[0.22em] text-bankroll-gold uppercase">
                  02 · Portrait · 16:9
                </p>
                <span className="relative flex items-center gap-2 font-sans text-[0.65rem] tracking-wide text-white/35 uppercase">
                  {busy && (
                    <span className="relative flex size-1.5">
                      <span className="absolute inset-0 animate-ping rounded-full bg-[#ff4d67] opacity-70" />
                      <span className="relative size-1.5 rounded-full bg-[#ff4d67]" />
                    </span>
                  )}
                  Live line
                </span>
              </div>

              <div className="relative flex aspect-video items-center justify-center overflow-hidden border border-white/12 bg-black/55">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(199,164,92,0.06)_0%,transparent_65%)]"
                />

                {resultUrl ? (
                  <motion.img
                    key={resultUrl}
                    src={resultUrl}
                    alt="Generated Bankroll PFP"
                    className="relative z-10 h-full w-full object-contain bg-black"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, ease: easeOut }}
                  />
                ) : busy ? (
                  <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
                    <Loader2 className="size-8 animate-spin text-bankroll-green" />
                    <p className="font-display text-xl text-white/70 italic">
                      Minting your outlaw portrait…
                    </p>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
                    <span
                      aria-hidden
                      className="size-2.5 rotate-45 bg-bankroll-ruby"
                    />
                    <p className="font-display text-xl text-white/40 italic">
                      Your cinematic hotline shot appears here
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={!resultUrl || downloading}
                  onClick={downloadToDevice}
                  className={`inline-flex flex-1 items-center justify-center gap-2 border px-4 py-3.5 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition ${
                    resultUrl
                      ? 'bankroll-green-shine border-bankroll-green/50 disabled:opacity-60'
                      : 'pointer-events-none border-white/10 text-white/30'
                  }`}
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  {downloading ? 'Saving…' : 'Download'}
                </button>
                <button
                  type="button"
                  disabled={!file || busy}
                  onClick={generate}
                  className="inline-flex flex-1 items-center justify-center gap-2 border border-bankroll-gold/45 bg-black/50 px-4 py-3.5 font-sans text-xs font-semibold tracking-[0.14em] text-bankroll-gold uppercase transition hover:border-bankroll-gold hover:bg-black/70 disabled:opacity-40"
                >
                  <RefreshCw className="size-4" />
                  Regenerate
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
