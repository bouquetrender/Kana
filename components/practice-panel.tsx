"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, Play, Pause, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type KanaChar, type DisplayType } from "@/lib/kana-data"
import { displayLabels } from "@/lib/practice"

interface PracticePanelProps {
  currentKana: KanaChar
  displayType: DisplayType
  isAuto: boolean
  autoInterval: number
  isPaused: boolean
  position: number
  total: number
  round: number
  onNext: () => void
  onReset: () => void
  onTogglePause: () => void
}

export function PracticePanel({
  currentKana,
  displayType,
  isAuto,
  autoInterval,
  isPaused,
  position,
  total,
  round,
  onNext,
  onReset,
  onTogglePause,
}: PracticePanelProps) {
  const [hintFor, setHintFor] = useState<string | null>(null)
  const cardId = `${round}-${position}`
  const showHint = hintFor === cardId

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey
      )
        return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest(
          "button, input, select, textarea, a, [contenteditable='true'], [role='slider'], [role='switch']"
        )
      )
        return
      if (event.code === "Space") {
        event.preventDefault()
        setHintFor(previous => (previous === cardId ? null : cardId))
      } else if (event.code === "ArrowRight" && !isAuto) {
        event.preventDefault()
        onNext()
      } else if (event.code === "KeyP" && isAuto) {
        event.preventDefault()
        onTogglePause()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [cardId, isAuto, onNext, onTogglePause])

  return (
    <section className="practice-layout" aria-label="假名练习">
      <div className="practice-toolbar">
        <Button variant="ghost" onClick={onReset}>
          <ArrowLeft size={16} />
          返回设置
        </Button>
        <span className="practice-mode">
          <i />
          {displayLabels[displayType]}
          <span> / </span>
          {isAuto ? (isPaused ? "已暂停" : "自动练习") : "手动练习"}
        </span>
      </div>
      <div className="practice-card panel">
        <div className="practice-card-header">
          <span>第 {round.toString().padStart(2, "0")} 轮</span>
          <span>
            <strong>{position.toString().padStart(2, "0")}</strong> / {total}
          </span>
        </div>
        <div
          className="practice-progress"
          role="progressbar"
          aria-label="本轮出题进度"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={position}
        >
          <span style={{ width: `${(position / total) * 100}%` }} />
        </div>
        <div
          className={`practice-character ${displayType === "romaji" ? "is-romaji" : ""}`}
          key={cardId}
          lang={displayType === "romaji" ? "en" : "ja"}
        >
          {currentKana[displayType]}
        </div>
        <div className="hint-area" aria-live="polite">
          {showHint && (
            <div className="hint-content">
              {(["hiragana", "katakana", "romaji"] as DisplayType[])
                .filter(type => type !== displayType)
                .map(type => (
                  <div key={type}>
                    <span>{displayLabels[type]}</span>
                    <strong lang={type === "romaji" ? "en" : "ja"}>
                      {currentKana[type]}
                    </strong>
                  </div>
                ))}
            </div>
          )}
        </div>
        <div className="practice-controls">
          <Button
            size="lg"
            variant="outline"
            aria-pressed={showHint}
            onClick={() => setHintFor(showHint ? null : cardId)}
          >
            {showHint ? <EyeOff size={17} /> : <Eye size={17} />}
            {showHint ? "隐藏提示" : "显示提示"}
          </Button>
          {isAuto ? (
            <Button
              size="lg"
              className="primary-action"
              onClick={onTogglePause}
            >
              {isPaused ? <Play size={17} /> : <Pause size={17} />}
              {isPaused ? "继续练习" : "暂停练习"}
            </Button>
          ) : (
            <Button size="lg" className="primary-action" onClick={onNext}>
              下一个
              <ArrowRight size={17} />
            </Button>
          )}
        </div>
        {isAuto && <p className="practice-caption">每 {autoInterval} 秒切换</p>}
      </div>
      <div className="keyboard-hints">
        <span>
          <kbd>Space</kbd> 显示 / 隐藏提示
        </span>
        <span>
          <kbd>{isAuto ? "P" : "→"}</kbd>{" "}
          {isAuto ? "暂停 / 继续" : "下一个假名"}
        </span>
      </div>
    </section>
  )
}
