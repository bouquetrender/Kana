"use client"

import { Moon } from "lucide-react"
import { SettingsPanel } from "@/components/settings-panel"
import { PracticePanel } from "@/components/practice-panel"
import { SummaryPanel } from "@/components/summary-panel"
import { useSavedSettings } from "@/lib/use-saved-settings"
import { usePractice } from "@/lib/use-practice"

export default function Home() {
  const {
    settings,
    setSettings,
    mastery,
    recordMastery,
    isLoaded,
    storageError,
  } = useSavedSettings()
  const {
    pool,
    session,
    start,
    next,
    mark,
    answer,
    togglePause,
    finish,
    reset,
  } = usePractice(settings, mastery, recordMastery)

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Kana 首页">
          <span className="brand-mark" lang="ja">
            か
          </span>
          <span>
            Kana<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="header-caption">日语假名练习室</span>
        {/* <span className="theme-indicator">
          <Moon size={14} /> 深色模式
        </span> */}
      </header>
      <main className="main-content">
        {storageError && (
          <p className="storage-error" role="status">
            浏览器存储不可用，当前设置和标记无法保存。
          </p>
        )}
        {!isLoaded ? (
          <p role="status">加载设置…</p>
        ) : session?.status === "completed" ? (
          <SummaryPanel
            session={session}
            onReset={() => {
              reset()
              window.scrollTo(0, 0)
            }}
            onRestart={selection => {
              start(selection)
              window.scrollTo(0, 0)
            }}
          />
        ) : session ? (
          <PracticePanel
            session={session}
            onNext={next}
            onFinish={() => {
              finish()
              window.scrollTo(0, 0)
            }}
            onTogglePause={togglePause}
            onMark={mark}
            onAnswer={answer}
          />
        ) : (
          <>
            <section className="page-intro">
              <h1>假名练习</h1>
            </section>
            <SettingsPanel
              settings={settings}
              onSettingsChange={setSettings}
              onStart={() => {
                start()
                window.scrollTo(0, 0)
              }}
              availableKana={pool}
              reviewCount={
                Object.values(mastery).filter(status => status === "learning")
                  .length
              }
            />
          </>
        )}
      </main>
    </div>
  )
}
