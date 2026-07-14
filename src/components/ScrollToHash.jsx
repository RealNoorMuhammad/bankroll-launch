import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToHashWhenReady } from '../lib/scrollToHash'

/**
 * Scrolls to #hash after route changes (works from /dashboard → /#howtobuy, etc).
 * Also scrolls to top when navigating to a path with no hash.
 */
export default function ScrollToHash() {
  const { pathname, hash, key } = useLocation()

  useEffect(() => {
    if (hash) {
      void scrollToHashWhenReady(hash)
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, hash, key])

  return null
}
