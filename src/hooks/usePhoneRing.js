import { useEffect, useRef, useState } from 'react'
import vintageRing from '../assets/Vintage.mp3'

/**
 * Plays the vintage ring tone once; `ringing` stays true until the clip ends.
 */
export function usePhoneRing() {
  const [ringing, setRinging] = useState(false)
  const audioRef = useRef(null)

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

  const ring = async () => {
    if (ringing) return false

    const audio = audioRef.current
    if (!audio) return false

    audio.currentTime = 0
    setRinging(true)

    try {
      await audio.play()
      return true
    } catch {
      setRinging(false)
      return false
    }
  }

  return { ringing, ring }
}
