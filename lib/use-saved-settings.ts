"use client"

import { useCallback, useEffect, useState } from "react"
import { type Mastery } from "./kana-data"
import { defaultSettings } from "./practice"
import {
  restoreSavedPractice,
  serializeSavedPractice,
  storageKey,
} from "./saved-settings"

export function useSavedSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [mastery, setMastery] = useState<Mastery>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    try {
      const saved = restoreSavedPractice(
        window.localStorage.getItem(storageKey)
      )
      setSettings(saved.settings)
      setMastery(saved.mastery)
    } catch {
      setStorageError(true)
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      window.localStorage.setItem(
        storageKey,
        serializeSavedPractice(settings, mastery)
      )
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [settings, mastery, isLoaded])

  const recordMastery = useCallback(
    (id: string, status: "known" | "learning") => {
      setMastery(previous =>
        previous[id] === status ? previous : { ...previous, [id]: status }
      )
    },
    []
  )

  return {
    settings,
    setSettings,
    mastery,
    recordMastery,
    isLoaded,
    storageError,
  }
}
