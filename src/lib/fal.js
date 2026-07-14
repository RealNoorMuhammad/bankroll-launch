import { fal } from '@fal-ai/client'

const key = import.meta.env.VITE_FAL_KEY?.trim()

export const isFalConfigured = Boolean(key)

export function getFal() {
  if (!key) {
    throw new Error('Missing VITE_FAL_KEY')
  }
  fal.config({
    credentials: key,
  })
  return fal
}

export { fal }