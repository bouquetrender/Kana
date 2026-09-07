"use client"

import {
  ArrowRight,
  Check,
  Layers3,
  SlidersHorizontal,
  Timer,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { KanaGrid } from "@/components/kana-grid"
import {
  rows,
  columns,
  dakuonRows,
  type DisplayType,
  type PracticeMode,
  type SelectionMode,
  type KanaSettings,
  type KanaChar,
} from "@/lib/kana-data"
import { displayLabels } from "@/lib/practice"

interface SettingsPanelProps {
  settings: KanaSettings
  onSettingsChange: (settings: KanaSettings) => void
  onStart: () => void
  availableKana: KanaChar[]
  reviewCount: number
}

export function SettingsPanel({
  settings,
  onSettingsChange,
  onStart,
  availableKana,
  reviewCount,
}: SettingsPanelProps) {
  const updateSettings = (updates: Partial<KanaSettings>) =>
    onSettingsChange({ ...settings, ...updates })
  const isCustom = settings.selectionMode === "custom"

  return (
    <div className="setup-layout">
      <section className="settings-card panel" aria-labelledby="settings-title">
        <div className="panel-heading">
          <span className="section-icon">
            <SlidersHorizontal size={17} />
          </span>
          <h2 id="settings-title">练习设置</h2>
        </div>
        <div className="settings-section">
          <Label id="display-label" className="field-label">
            显示类型
          </Label>
          <div
            className="display-options"
            role="group"
            aria-labelledby="display-label"
          >
            {(["hiragana", "katakana", "romaji"] as DisplayType[]).map(
              (type, index) => (
                <button
                  key={type}
                  type="button"
                  className="display-option"
                  aria-pressed={settings.displayType === type}
                  onClick={() => updateSettings({ displayType: type })}
                >
                  <span
                    className="display-sample"
                    lang={type === "romaji" ? "en" : "ja"}
                  >
                    {["あ", "ア", "a"][index]}
                  </span>
                  <span>{displayLabels[type]}</span>
                  {settings.displayType === type && (
                    <Check size={12} className="option-check" />
                  )}
                </button>
              )
            )}
          </div>
        </div>
        <div className="settings-section">
          <Label htmlFor="selection-mode" className="field-label">
            练习范围<span>{availableKana.length} 个假名</span>
          </Label>
          <Select
            value={settings.selectionMode}
            onValueChange={value =>
              updateSettings({ selectionMode: value as SelectionMode })
            }
          >
            <SelectTrigger id="selection-mode" className="range-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部假名</SelectItem>
              <SelectItem value="seion">仅清音（46 个）</SelectItem>
              <SelectItem value="review">不熟悉（{reviewCount} 个）</SelectItem>
              <SelectItem value="dakuon">浊音 / 半浊音</SelectItem>
              <SelectItem value="row">按行选择（横向）</SelectItem>
              <SelectItem value="column">按段选择（竖向）</SelectItem>
              <SelectItem value="custom">自定义选择</SelectItem>
            </SelectContent>
          </Select>
          {(settings.selectionMode === "row" ||
            settings.selectionMode === "column") && (
            <div
              className="range-chips"
              role="group"
              aria-label={
                settings.selectionMode === "row" ? "选择行" : "选择段"
              }
            >
              {(settings.selectionMode === "row"
                ? [...rows, ...dakuonRows]
                : columns
              ).map(value => {
                const key =
                  settings.selectionMode === "row"
                    ? "selectedRows"
                    : "selectedColumns"
                const selected = settings[key].includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      updateSettings({
                        [key]: selected
                          ? settings[key].filter(item => item !== value)
                          : [...settings[key], value],
                      })
                    }
                  >
                    {value}
                    {key === "selectedRows" ? "行" : "段"}
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div className="settings-section">
          <Label id="practice-mode-label" className="field-label">
            练习方式
          </Label>
          <div
            className="mode-options"
            role="group"
            aria-labelledby="practice-mode-label"
          >
            {(["flashcard", "input"] as PracticeMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                aria-pressed={settings.practiceMode === mode}
                onClick={() => updateSettings({ practiceMode: mode })}
              >
                {mode === "flashcard" ? "翻卡记忆" : "输入答案"}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-section">
          <Label htmlFor="round-count" className="field-label">
            练习轮次
            <span>
              {settings.roundCount
                ? `共 ${availableKana.length * settings.roundCount} 题`
                : "不限题数"}
            </span>
          </Label>
          <Select
            value={String(settings.roundCount)}
            onValueChange={value =>
              updateSettings({ roundCount: Number(value) })
            }
          >
            <SelectTrigger id="round-count" className="range-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 3, 5, 0].map(count => (
                <SelectItem key={count} value={String(count)}>
                  {count ? `${count} 轮` : "无限"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {settings.practiceMode === "flashcard" && (
          <div className="settings-section pace-section">
            <div className="pace-header">
              <div>
                <Label htmlFor="auto-mode" className="field-label">
                  <Timer size={15} /> 自动切换
                </Label>
              </div>
              <Switch
                id="auto-mode"
                checked={settings.isAuto}
                onCheckedChange={isAuto => updateSettings({ isAuto })}
              />
            </div>
            {settings.isAuto && (
              <div className="interval-setting">
                <div>
                  <span id="interval-label">切换间隔</span>
                  <strong>
                    {settings.autoInterval}
                    <span> 秒</span>
                  </strong>
                </div>
                <Slider
                  aria-labelledby="interval-label"
                  min={1}
                  max={10}
                  step={1}
                  value={[settings.autoInterval]}
                  onValueChange={value =>
                    updateSettings({ autoInterval: value[0] })
                  }
                />
                <div className="slider-labels">
                  <span>1 秒</span>
                  <span>10 秒</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="start-section">
          <Button
            onClick={onStart}
            disabled={availableKana.length === 0}
            className="start-button"
            size="lg"
          >
            开始练习
            <ArrowRight size={18} />
          </Button>
          <p aria-live="polite">
            {availableKana.length === 0 && "请先选择至少一个假名"}
          </p>
        </div>
      </section>
      <section className="chart-card panel" aria-labelledby="chart-title">
        <div className="panel-heading">
          <span className="section-icon">
            <Layers3 size={17} />
          </span>
          <h2 id="chart-title">{displayLabels[settings.displayType]}一览</h2>
          <span className="count-badge">{availableKana.length} 已选</span>
        </div>
        <div className="chart-description">
          <span>
            <i />
            练习范围
          </span>
        </div>
        <KanaGrid
          displayType={settings.displayType}
          selectedKana={availableKana}
          interactive={isCustom}
          onSelectionChange={customSelected =>
            updateSettings({ customSelected })
          }
        />
        <div className="chart-footer">
          <span>清音 46 · 浊音 / 半浊音 25</span>
          {isCustom ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={!availableKana.length}
              onClick={() => updateSettings({ customSelected: [] })}
            >
              清空选择
            </Button>
          ) : (
            <span>五十音 · 五段</span>
          )}
        </div>
      </section>
    </div>
  )
}
