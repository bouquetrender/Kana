"use client"

import { Fragment, useRef, useState, type PointerEvent } from "react"
import {
  kanaData,
  rows,
  dakuonRows,
  columns,
  type KanaChar,
  type DisplayType,
} from "@/lib/kana-data"

const gridRows = [...rows, ...dakuonRows].map(row => ({
  label: row,
  cells: columns
    .slice(0, 5)
    .map(column =>
      kanaData.find(kana => kana.row === row && kana.column === column)
    ),
}))
gridRows.push({
  label: "撥音",
  cells: [
    kanaData.find(kana => kana.hiragana === "ん"),
    undefined,
    undefined,
    undefined,
    undefined,
  ],
})

interface KanaGridProps {
  displayType: DisplayType
  selectedKana: KanaChar[]
  interactive: boolean
  onSelectionChange: (selection: KanaChar[]) => void
}

interface DragBox {
  startX: number
  startY: number
  x: number
  y: number
}

export function KanaGrid({
  displayType,
  selectedKana,
  interactive,
  onSelectionChange,
}: KanaGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)
  const [box, setBox] = useState<DragBox | null>(null)
  const selected = new Set(selectedKana.map(kana => kana.hiragana))

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (!start || !gridRef.current) return
    if (
      !suppressClick.current &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) < 5
    )
      return
    suppressClick.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = gridRef.current.getBoundingClientRect()
    setBox({
      startX: start.x - rect.left,
      startY: start.y - rect.top,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current
    if (start && suppressClick.current && gridRef.current) {
      const left = Math.min(start.x, event.clientX)
      const right = Math.max(start.x, event.clientX)
      const top = Math.min(start.y, event.clientY)
      const bottom = Math.max(start.y, event.clientY)
      const next = new Set(selected)
      gridRef.current
        .querySelectorAll<HTMLButtonElement>("button[data-kana]")
        .forEach(button => {
          const rect = button.getBoundingClientRect()
          if (
            rect.left < right &&
            rect.right > left &&
            rect.top < bottom &&
            rect.bottom > top
          )
            next.add(button.dataset.kana!)
        })
      onSelectionChange(kanaData.filter(kana => next.has(kana.hiragana)))
    }
    dragStart.current = null
    setBox(null)
  }

  return (
    <div
      ref={gridRef}
      className="kana-grid"
      role="group"
      aria-label={interactive ? "自定义假名选择" : "假名范围预览"}
      onPointerDown={event => {
        suppressClick.current = false
        if (interactive && event.pointerType === "mouse" && event.button === 0)
          dragStart.current = { x: event.clientX, y: event.clientY }
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragStart.current = null
        setBox(null)
      }}
      onLostPointerCapture={() => {
        dragStart.current = null
        setBox(null)
      }}
      onClickCapture={event => {
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault()
          event.stopPropagation()
        }
      }}
    >
      <span className="grid-column-label">行 / 段</span>
      {["a", "i", "u", "e", "o"].map(column => (
        <span key={column} className="grid-column-label">
          {column}
        </span>
      ))}
      {gridRows.map(({ label, cells }) => (
        <Fragment key={label}>
          <span
            className={`grid-row-label ${label === "が" ? "dakuon-divider" : ""}`}
            lang="ja"
          >
            {label}
          </span>
          {cells.map((kana, index) => {
            const className = `kana-cell ${kana && selected.has(kana.hiragana) ? "is-selected" : ""} ${label === "が" ? "dakuon-divider" : ""}`
            if (!kana)
              return (
                <span
                  key={index}
                  className={`kana-empty ${label === "が" ? "dakuon-divider" : ""}`}
                >
                  —
                </span>
              )
            return interactive ? (
              <button
                key={kana.hiragana}
                type="button"
                data-kana={kana.hiragana}
                className={className}
                aria-label={`${kana.hiragana} / ${kana.katakana} / ${kana.romaji}`}
                aria-pressed={selected.has(kana.hiragana)}
                onClick={() =>
                  onSelectionChange(
                    selected.has(kana.hiragana)
                      ? selectedKana.filter(
                          item => item.hiragana !== kana.hiragana
                        )
                      : [...selectedKana, kana]
                  )
                }
              >
                <span lang={displayType === "romaji" ? "en" : "ja"}>
                  {kana[displayType]}
                </span>
              </button>
            ) : (
              <span
                key={kana.hiragana}
                className={className}
                lang={displayType === "romaji" ? "en" : "ja"}
              >
                {kana[displayType]}
              </span>
            )
          })}
        </Fragment>
      ))}
      {box && (
        <div
          className="selection-box"
          style={{
            left: Math.min(box.startX, box.x),
            top: Math.min(box.startY, box.y),
            width: Math.abs(box.x - box.startX),
            height: Math.abs(box.y - box.startY),
          }}
        />
      )}
    </div>
  )
}
