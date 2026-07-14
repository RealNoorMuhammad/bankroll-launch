const NAV_OFFSET = 88

export function scrollToHash(hash, { behavior = 'smooth' } = {}) {
  const id = String(hash || '').replace(/^#/, '')
  if (!id) return false

  const el = document.getElementById(id)
  if (!el) return false

  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET
  window.scrollTo({ top: Math.max(0, top), behavior })
  return true
}

/** Retry until the target exists (route content may mount a tick late). */
export function scrollToHashWhenReady(hash, { behavior = 'smooth', tries = 40 } = {}) {
  return new Promise((resolve) => {
    let left = tries
    const tick = () => {
      if (scrollToHash(hash, { behavior })) {
        resolve(true)
        return
      }
      left -= 1
      if (left <= 0) {
        resolve(false)
        return
      }
      window.setTimeout(tick, 40)
    }
    tick()
  })
}
