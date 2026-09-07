"use client"

import { useState } from "react"
import { Moon } from "lucide-react"
import { SettingsPanel } from "@/components/settings-panel"
import { PracticePanel } from "@/components/practice-panel"
import { defaultSettings } from "@/lib/practice"
import { usePractice } from "@/lib/use-practice"

export default function Home() {
  const [settings, setSettings] = useState(defaultSettings)
  const { pool, session, start, next, togglePause, reset } =
    usePractice(settings)

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
        <span className="theme-indicator">
          <Moon size={14} /> 深色模式
        </span>
      </header>
      <main className="main-content">
        {session ? (
          <PracticePanel
            currentKana={session.deck[session.index]}
            displayType={settings.displayType}
            isAuto={settings.isAuto}
            autoInterval={settings.autoInterval}
            isPaused={session.isPaused}
            position={session.index + 1}
            total={session.deck.length}
            round={session.round}
            onNext={next}
            onReset={() => {
              reset()
              window.scrollTo(0, 0)
            }}
            onTogglePause={togglePause}
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
            />
          </>
        )}
      </main>
    </div>
  )
}
