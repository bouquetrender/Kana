"use client"

import { ArrowLeft, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { type KanaChar } from "@/lib/kana-data"
import {
  displayLabels,
  summarizeSession,
  type PracticeSession,
} from "@/lib/practice"

interface SummaryPanelProps {
  session: PracticeSession
  onReset: () => void
  onRestart: (pool: KanaChar[]) => void
}

export function SummaryPanel({
  session,
  onReset,
  onRestart,
}: SummaryPanelProps) {
  const { counts, reviewKana, elapsedSeconds, accuracy } =
    summarizeSession(session)
  const isInput = session.settings.practiceMode === "input"
  const planned = session.settings.roundCount * session.pool.length
  return (
    <section className="summary-layout" aria-labelledby="summary-title">
      <div className="practice-toolbar">
        <Button variant="ghost" onClick={onReset}>
          <ArrowLeft size={16} />
          返回设置
        </Button>
        <span className="practice-mode">
          {displayLabels[session.settings.displayType]} /{" "}
          {isInput ? "输入答案" : "翻卡记忆"}
        </span>
      </div>
      <div className="panel summary-card">
        <h1 id="summary-title">练习汇总</h1>
        <div className="summary-overview">
          <div>
            <span>已完成</span>
            <strong>
              {session.results.length}
              <small>{planned > 0 ? ` / ${planned}` : ""} 题</small>
            </strong>
          </div>
          <div>
            <span>练习用时</span>
            <strong>
              {Math.floor(elapsedSeconds / 60)}
              <small> 分 </small>
              {elapsedSeconds % 60}
              <small> 秒</small>
            </strong>
          </div>
          {isInput && (
            <div>
              <span>答题正确率</span>
              <strong>{accuracy === null ? "—" : `${accuracy}%`}</strong>
            </div>
          )}
        </div>
        <dl className="summary-counts">
          <div>
            <dt>{isInput ? "答对" : "认识"}</dt>
            <dd>{isInput ? counts.correct : counts.known}</dd>
          </div>
          <div>
            <dt>{isInput ? "答错" : "不熟悉"}</dt>
            <dd>{isInput ? counts.incorrect : counts.learning}</dd>
          </div>
          <div>
            <dt>{isInput ? "跳过" : "未标记"}</dt>
            <dd>{counts.skipped}</dd>
          </div>
        </dl>
        <div className="summary-review">
          <h2>
            本次待复习 <span>{reviewKana.length}</span>
          </h2>
          {reviewKana.length ? (
            <div className="review-kana-list">
              {reviewKana.map(kana => (
                <span key={kana.hiragana}>
                  <strong lang="ja">
                    {kana[session.settings.displayType]}
                  </strong>
                  <small>
                    {session.settings.displayType === "romaji"
                      ? kana.hiragana
                      : kana.romaji}
                  </small>
                </span>
              ))}
            </div>
          ) : (
            <p>无</p>
          )}
        </div>
        <div className="summary-actions">
          <Button variant="outline" onClick={() => onRestart(session.pool)}>
            <RotateCcw size={16} />
            再练一次
          </Button>
          <Button
            className="primary-action"
            disabled={!reviewKana.length}
            onClick={() => onRestart(reviewKana)}
          >
            复习不熟悉（{reviewKana.length}）
          </Button>
        </div>
      </div>
    </section>
  )
}
