"use client"

import { useState, useEffect, type FormEvent } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { type DisplayType } from "@/lib/kana-data"
import {
  displayLabels,
  sessionCardId,
  type PracticeSession,
} from "@/lib/practice"

interface PracticePanelProps {
  session: PracticeSession
  onNext: () => void
  onFinish: () => void
  onTogglePause: () => void
  onMark: (outcome: "known" | "learning") => void
  onAnswer: (answer: string) => void
}

function AnswerForm({
  session,
  onAnswer,
  onNext,
  nextLabel,
}: Pick<PracticePanelProps, "session" | "onAnswer" | "onNext"> & {
  nextLabel: string
}) {
  const [answer, setAnswer] = useState("")
  const result = session.currentResult
  const expectsKana = session.settings.displayType === "romaji"
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (result) onNext()
    else if (answer.trim()) onAnswer(answer)
  }

  return (
    <form className="answer-form" onSubmit={handleSubmit}>
      <label htmlFor="answer-input">
        {expectsKana ? "假名（平假名或片假名）" : "罗马音"}
      </label>
      <div className="answer-input-row">
        <input
          id="answer-input"
          autoFocus
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          value={answer}
          onChange={event => setAnswer(event.target.value)}
          readOnly={!!result}
          aria-invalid={result?.outcome === "incorrect"}
          aria-describedby="answer-feedback"
          onKeyDown={event => {
            if (
              event.key === "Enter" &&
              (event.nativeEvent.isComposing || event.keyCode === 229)
            )
              event.preventDefault()
          }}
        />
        <Button
          type="submit"
          className="primary-action"
          disabled={!result && !answer.trim()}
        >
          {result ? nextLabel : "提交答案"}
        </Button>
      </div>
      <div
        id="answer-feedback"
        className={`answer-feedback ${result?.outcome === "incorrect" ? "is-incorrect" : ""}`}
        role="status"
      >
        {result &&
          (result.outcome === "correct" ? (
            <>
              <Check size={16} />
              正确
            </>
          ) : (
            <>
              <X size={16} />
              错误
            </>
          ))}
      </div>
      {!result && (
        <Button type="button" variant="ghost" onClick={onNext}>
          跳过
        </Button>
      )}
    </form>
  )
}

export function PracticePanel({
  session,
  onNext,
  onFinish,
  onTogglePause,
  onMark,
  onAnswer,
}: PracticePanelProps) {
  const [hintFor, setHintFor] = useState<string | null>(null)
  const { settings, currentResult } = session
  const { displayType } = settings
  const cardId = sessionCardId(session)
  const currentKana = session.deck[session.index]
  const isInput = settings.practiceMode === "input"
  const isAuto = !isInput && settings.isAuto
  const isPaused = session.pausedAt !== null
  const showHint = !!currentResult || (!isInput && hintFor === cardId)
  const isLast =
    settings.roundCount > 0 &&
    session.round === settings.roundCount &&
    session.index + 1 === session.deck.length
  const nextLabel = isLast ? "查看汇总" : "下一题"

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        event.isComposing ||
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
      if (event.code === "Space" && !isInput) {
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
  }, [cardId, isInput, isAuto, onNext, onTogglePause])

  return (
    <section className="practice-layout" aria-label="假名练习">
      <div className="practice-toolbar">
        <Button variant="ghost" onClick={onFinish}>
          <ArrowLeft size={16} />
          结束练习
        </Button>
        <span className="practice-mode">
          <i />
          {displayLabels[displayType]}
          <span> / </span>
          {isInput
            ? "输入答案"
            : isAuto
              ? isPaused
                ? "已暂停"
                : "自动翻卡"
              : "翻卡记忆"}
        </span>
      </div>
      <div className="practice-card panel">
        <div className="practice-card-header">
          <span>
            第 {session.round}{" "}
            {settings.roundCount > 0 && `/ ${settings.roundCount}`} 轮
          </span>
          <span>
            <strong>{session.index + 1}</strong> / {session.deck.length}
          </span>
        </div>
        <div
          className="practice-progress"
          role="progressbar"
          aria-label="本轮出题进度"
          aria-valuemin={0}
          aria-valuemax={session.deck.length}
          aria-valuenow={session.index + 1}
        >
          <span
            style={{
              width: `${((session.index + 1) / session.deck.length) * 100}%`,
            }}
          />
        </div>
        <div
          className={`practice-character ${displayType === "romaji" ? "is-romaji" : ""}`}
          key={`character-${cardId}`}
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
        {isInput ? (
          <AnswerForm
            key={`answer-${cardId}`}
            session={session}
            onAnswer={onAnswer}
            onNext={onNext}
            nextLabel={nextLabel}
          />
        ) : (
          <>
            <div className="practice-controls">
              <Button
                size="lg"
                variant="outline"
                aria-pressed={showHint}
                disabled={!!currentResult}
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
                  {currentResult ? nextLabel : isLast ? "跳过并结束" : "跳过"}
                  <ArrowRight size={17} />
                </Button>
              )}
            </div>
            <div
              className="mastery-controls"
              role="group"
              aria-label="掌握情况"
            >
              <Button
                variant="outline"
                disabled={!showHint || !!currentResult}
                aria-pressed={currentResult?.outcome === "learning"}
                onClick={() => onMark("learning")}
              >
                不熟悉
              </Button>
              <Button
                variant="outline"
                disabled={!showHint || !!currentResult}
                aria-pressed={currentResult?.outcome === "known"}
                onClick={() => onMark("known")}
              >
                认识
              </Button>
            </div>
            <p className="practice-caption" aria-live="polite">
              {currentResult
                ? currentResult.outcome === "known"
                  ? "已标记：认识"
                  : "已标记：不熟悉"
                : isAuto
                  ? `每 ${settings.autoInterval} 秒切换`
                  : ""}
            </p>
          </>
        )}
      </div>
      <div className="keyboard-hints">
        {isInput ? (
          <span>
            <kbd>Enter</kbd> 提交 / 下一题
          </span>
        ) : (
          <>
            <span>
              <kbd>Space</kbd> 显示 / 隐藏提示
            </span>
            <span>
              <kbd>{isAuto ? "P" : "→"}</kbd>{" "}
              {isAuto ? "暂停 / 继续" : "下一题"}
            </span>
          </>
        )}
      </div>
    </section>
  )
}
