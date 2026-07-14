import { useCallback, useEffect, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

function countPresences(state) {
  return Object.values(state).reduce((sum, entries) => sum + entries.length, 0)
}

function visitorId() {
  const key = 'bankroll_visitor_id'
  try {
    let id = localStorage.getItem(key)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

/**
 * Live ring counter + online presence via Supabase.
 * Falls back to local counting if env vars are missing.
 */
export function usePhoneLiveStats() {
  const [ringCount, setRingCount] = useState(0)
  const [onlineCount, setOnlineCount] = useState(1)
  const [ready, setReady] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setReady(true)
      return undefined
    }

    let cancelled = false
    const client = supabase

    async function loadCount() {
      const { data, error } = await client
        .from('phone_stats')
        .select('ring_count')
        .eq('id', 1)
        .maybeSingle()

      if (!cancelled && !error && data) {
        setRingCount(Number(data.ring_count) || 0)
      }
      if (!cancelled) setReady(true)
    }

    loadCount()

    const statsChannel = client
      .channel('phone-stats')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'phone_stats',
          filter: 'id=eq.1',
        },
        (payload) => {
          const next = payload.new?.ring_count
          if (typeof next === 'number') setRingCount(next)
        },
      )
      .subscribe()

    const presenceChannel = client.channel('bankroll-lobby', {
      config: {
        presence: {
          key: visitorId(),
          enabled: true,
        },
      },
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        setOnlineCount(Math.max(1, countPresences(presenceChannel.presenceState())))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
          })
        }
      })

    channelRef.current = { statsChannel, presenceChannel }

    return () => {
      cancelled = true
      client.removeChannel(statsChannel)
      client.removeChannel(presenceChannel)
    }
  }, [])

  const recordRing = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setRingCount((n) => n + 1)
      return
    }

    const { data, error } = await supabase.rpc('increment_phone_rings')
    if (error) {
      console.error('Failed to increment phone rings', error)
      setRingCount((n) => n + 1)
      return
    }

    if (typeof data === 'number') {
      setRingCount(data)
    }
  }, [])

  return {
    ringCount,
    onlineCount,
    ready,
    recordRing,
    configured: isSupabaseConfigured,
  }
}
