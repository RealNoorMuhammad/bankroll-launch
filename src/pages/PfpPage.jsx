import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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

const STATUS = {
  idle: 'idle',
  uploading: 'uploading',
  generating: 'generating',
  done: 'done',
  error: 'error',
}

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
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [status, setStatus] = useState(STATUS.idle)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const resetResult = () => {
    setResultUrl('')
    setError('')
    setProgress('')
    setStatus(STATUS.idle)
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

      // Nano Banana Pro: dual refs (character PFP + Robin Hood hat) + dial typography
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
      <section
        className="relative isolate overflow-hidden px-5 pt-28 pb-16 sm:px-8 sm:pt-32 sm:pb-20"
        style={{
          background:
            'linear-gradient(165deg, #050505 0%, #140308 38%, #0a0204 70%, #050505 100%)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(176,16,48,0.32)_0%,transparent_52%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(35,87,1,0.07)_0%,transparent_45%)]"
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-bankroll-gold/40 bg-black/55 px-3.5 py-1.5 backdrop-blur-md">
              <Sparkles className="size-3.5 text-bankroll-green" strokeWidth={2} aria-hidden />
              <span className="font-sans text-[0.65rem] font-semibold tracking-[0.22em] text-bankroll-gold uppercase">
                PFP studio
              </span>
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#ff4d67] opacity-70" />
                <span className="relative size-2 rounded-full bg-[#ff4d67]" />
              </span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Make your{' '}
              <span className="text-bankroll-green">
                outlaw PFP
              </span>
            </h1>
            <p className="mt-4 font-display text-lg text-white/65 italic sm:text-xl">
              Upload any cartoon, meme, or avatar. We lock your character and the Robin Hood hat from our reference — then put them on the hotline.
            </p>
          </div>

          {!isFalConfigured && (
            <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-[#ff4d67]/40 bg-[#2b0812]/80 px-4 py-3 text-center font-sans text-sm text-[#ffb3be]">
              Add <code className="text-bankroll-green">VITE_FAL_KEY</code> to your{' '}
              <code className="text-bankroll-gold">.env</code> and restart the server to enable generation.
            </div>
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Upload */}
            <div className="rounded-2xl border border-bankroll-gold/30 bg-black/55 p-5 backdrop-blur-md sm:p-6">
              <p className="font-sans text-[0.65rem] tracking-[0.2em] text-bankroll-gold uppercase">
                01 · Upload
              </p>

              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`mt-4 relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed transition sm:min-h-[320px] ${
                  dragOver
                    ? 'border-bankroll-green bg-bankroll-green/5'
                    : 'border-white/20 bg-black/40 hover:border-bankroll-gold/50'
                }`}
                onClick={() => inputRef.current?.click()}
              >
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
                      className="absolute inset-0 h-full w-full object-contain p-4"
                    />
                    <button
                      type="button"
                      className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white hover:bg-black"
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
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <div className="flex size-14 items-center justify-center rounded-full border border-bankroll-gold/40 bg-black/60">
                      <ImagePlus className="size-6 text-bankroll-gold" />
                    </div>
                    <p className="font-display text-xl text-white">Drop your PFP here</p>
                    <p className="font-sans text-sm text-white/50">
                      PNG / JPG / WEBP · up to 10MB
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
                    <Sparkles className="size-4" />
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
            </div>

            {/* Result */}
            <div className="rounded-2xl border border-bankroll-gold/30 bg-black/55 p-5 backdrop-blur-md sm:p-6">
              <p className="font-sans text-[0.65rem] tracking-[0.2em] text-bankroll-gold uppercase">
                02 · Result · 16:9
              </p>

              <div className="relative mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/50">
                {resultUrl ? (
                  <img
                    src={resultUrl}
                    alt="Generated Bankroll PFP"
                    className="h-full w-full object-contain bg-black"
                  />
                ) : busy ? (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <Loader2 className="size-8 animate-spin text-bankroll-green" />
                    <p className="font-display text-lg text-white/70 italic">
                      Minting your outlaw portrait…
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-6 text-center">
                    <span className="size-3 rotate-45 bg-[#ff2d4a] " />
                    <p className="font-display text-lg text-white/45 italic">
                      Your cinematic hotline shot appears here
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <a
                  href={resultUrl || undefined}
                  download="bankroll-pfp.png"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 font-sans text-xs font-semibold tracking-wide uppercase transition ${
                    resultUrl
                      ? 'bankroll-green-shine border border-bankroll-green/50'
                      : 'pointer-events-none border-white/10 text-white/30'
                  }`}
                >
                  <Download className="size-4" />
                  Download
                </a>
                <button
                  type="button"
                  disabled={!file || busy}
                  onClick={generate}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-bankroll-gold/50 bg-black/60 px-4 py-3 font-sans text-xs font-semibold tracking-wide text-bankroll-gold uppercase transition hover:border-bankroll-gold disabled:opacity-40"
                >
                  <RefreshCw className="size-4" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/"
              className="font-sans text-sm tracking-wide text-white/50 uppercase transition hover:text-bankroll-gold"
            >
              ← Back to hotline
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
