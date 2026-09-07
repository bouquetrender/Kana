"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { type KanaChar, type KanaSettings } from "./kana-data"
import { filterKana, shuffleKana } from "./practice"

interface Session {
  deck: KanaChar[]
  index: number
  round: number
  isPaused: boolean
}

export function usePractice(settings: KanaSettings) {
  const pool = useMemo(() => filterKana(settings), [settings])
  const [session, setSession] = useState<Session | null>(null)

  const start = () => {
    if (pool.length === 0) return
    setSession({ deck: shuffleKana(pool), index: 0, round: 1, isPaused: false })
  }

  const next = useCallback(() => {
    if (!session) return
    const index = session.index + 1
    setSession(
      index < session.deck.length
        ? { ...session, index }
        : {
            ...session,
            deck: shuffleKana(pool, session.deck[session.index]),
            index: 0,
            round: session.round + 1,
          }
    )
  }, [pool, session])

  useEffect(() => {
    if (!session || !settings.isAuto || session.isPaused) return
    const timer = window.setTimeout(next, settings.autoInterval * 1000)
    return () => window.clearTimeout(timer)
  }, [next, session, settings.isAuto, settings.autoInterval])

  const togglePause = useCallback(() => {
    setSession(previous =>
      previous ? { ...previous, isPaused: !previous.isPaused } : previous
    )
  }, [])
  const reset = useCallback(() => setSession(null), [])

  return { pool, session, start, next, togglePause, reset }
}
