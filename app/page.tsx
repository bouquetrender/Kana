"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { SettingsPanel } from "@/components/settings-panel"
import { PracticePanel } from "@/components/practice-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { kanaData, type KanaSettings, type KanaChar } from "@/lib/kana-data"

export default function Home() {
  const [isPracticing, setIsPracticing] = useState(false)
  const [currentKana, setCurrentKana] = useState<KanaChar | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [usedKana, setUsedKana] = useState<Set<string>>(new Set())

  const [settings, setSettings] = useState<KanaSettings>({
    displayType: "hiragana",
    selectionMode: "all",
    selectedRows: [],
    selectedColumns: [],
    customSelected: [],
    isAuto: false,
    autoInterval: 3,
  })

  const getFilteredKana = useCallback(() => {
    if (settings.selectionMode === "all") {
      return kanaData
    } else if (settings.selectionMode === "row") {
      return kanaData.filter(k => settings.selectedRows.includes(k.row))
    } else if (settings.selectionMode === "column") {
      return kanaData.filter(k => settings.selectedColumns.includes(k.column))
    } else {
      return settings.customSelected
    }
  }, [settings])

  const getRandomKana = useCallback(() => {
    const available = getFilteredKana()
    if (available.length === 0) return null

    // 如果所有假名都用过了，重置
    if (usedKana.size >= available.length) {
      setUsedKana(new Set())
    }

    // 过滤掉已使用的假名
    const unused = available.filter(k => !usedKana.has(k.hiragana))
    const pool = unused.length > 0 ? unused : available

    const randomIndex = Math.floor(Math.random() * pool.length)
    const selected = pool[randomIndex]

    setUsedKana(prev => new Set([...prev, selected.hiragana]))
    return selected
  }, [getFilteredKana, usedKana])

  const handleStart = () => {
    const firstKana = getRandomKana()
    if (firstKana) {
      setCurrentKana(firstKana)
      setIsPracticing(true)
      setIsPaused(false)
      setUsedKana(new Set([firstKana.hiragana]))
    }
  }

  const handleNext = () => {
    const nextKana = getRandomKana()
    if (nextKana) {
      setCurrentKana(nextKana)
    }
  }

  const handleReset = () => {
    setIsPracticing(false)
    setCurrentKana(null)
    setIsPaused(false)
    setUsedKana(new Set())
  }

  const handleTogglePause = () => {
    setIsPaused(!isPaused)
  }

  // 自动播放逻辑
  useEffect(() => {
    if (!isPracticing || !settings.isAuto || isPaused) return

    const timer = setInterval(() => {
      handleNext()
    }, settings.autoInterval * 1000)

    return () => clearInterval(timer)
  }, [isPracticing, settings.isAuto, settings.autoInterval, isPaused, handleNext])

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-4 left-5 right-3 flex items-center justify-between z-50">
        <h1 className="text-3xl font-bold tracking-tight">
          Kana
        </h1>
        <ThemeToggle />
      </div>


      {!isPracticing ? (
        <main className="w-full min-h-screen flex items-center justify-center p-4 pt-20 pb-8">
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            onStart={handleStart}
          />
        </main>
      ) : (
        <main className="w-full flex items-center justify-center">
          <PracticePanel
            currentKana={currentKana}
            displayType={settings.displayType}
            isAuto={settings.isAuto}
            isPaused={isPaused}
            onNext={handleNext}
            onReset={handleReset}
            onTogglePause={handleTogglePause}
          />
        </main>
      )}

    </div>
  )
}
