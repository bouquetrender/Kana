"use client"

import { useCallback, useEffect, useMemo, useReducer } from "react"
import { type KanaChar, type KanaSettings, type Mastery } from "./kana-data"
import {
  createSession,
  filterKana,
  practiceReducer,
  sessionCardId,
  shuffleKana,
} from "./practice"

export function usePractice(
  settings: KanaSettings,
  mastery: Mastery,
  recordMastery: (id: string, status: "known" | "learning") => void
) {
  const pool = useMemo(() => filterKana(settings, mastery), [settings, mastery])
  const [session, dispatch] = useReducer(practiceReducer, null)

  const start = (selection: KanaChar[] = pool) => {
    if (!selection.length) return
    dispatch({
      type: "start",
      session: createSession(
        settings,
        selection,
        shuffleKana(selection),
        Date.now()
      ),
    })
  }

  const next = useCallback(() => {
    if (!session || session.status !== "active") return
    const needsDeck =
      session.index + 1 === session.deck.length &&
      (session.settings.roundCount === 0 ||
        session.round < session.settings.roundCount)
    dispatch({
      type: "next",
      cardId: sessionCardId(session),
      now: Date.now(),
      deck: needsDeck
        ? shuffleKana(session.pool, session.deck[session.index])
        : session.deck,
    })
  }, [session])

  useEffect(() => {
    if (
      !session ||
      session.status !== "active" ||
      session.settings.practiceMode !== "flashcard" ||
      !session.settings.isAuto ||
      session.pausedAt !== null
    )
      return
    const timer = window.setTimeout(next, session.settings.autoInterval * 1000)
    return () => window.clearTimeout(timer)
  }, [next, session])

  const latestResult =
    session?.currentResult ?? session?.results[session.results.length - 1]
  useEffect(() => {
    if (!latestResult || latestResult.outcome === "skipped") return
    recordMastery(
      latestResult.kana.hiragana,
      ["known", "correct"].includes(latestResult.outcome) ? "known" : "learning"
    )
  }, [latestResult, recordMastery])

  const mark = (outcome: "known" | "learning") => {
    if (session)
      dispatch({ type: "mark", cardId: sessionCardId(session), outcome })
  }
  const answer = (value: string) => {
    if (session)
      dispatch({
        type: "answer",
        cardId: sessionCardId(session),
        answer: value,
      })
  }
  const togglePause = useCallback(
    () => dispatch({ type: "pause", now: Date.now() }),
    []
  )
  const finish = () => dispatch({ type: "finish", now: Date.now() })
  const reset = () => dispatch({ type: "reset" })

  return {
    pool,
    session,
    start,
    next,
    mark,
    answer,
    togglePause,
    finish,
    reset,
  }
}
