import {
  columns,
  dakuonRows,
  kanaData,
  rows,
  type KanaSettings,
  type Mastery,
} from "./kana-data"
import { defaultSettings } from "./practice"

export const storageKey = "kana.practice.v1"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function selectedValues(value: unknown, allowed: string[]): string[] {
  return Array.isArray(value)
    ? allowed.filter(item => value.includes(item))
    : []
}

export function restoreSavedPractice(raw: string | null): {
  settings: KanaSettings
  mastery: Mastery
} {
  const fallback = { settings: { ...defaultSettings }, mastery: {} }
  if (!raw) return fallback
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return fallback
  }
  if (!isRecord(parsed) || parsed.version !== 1) return fallback
  const value = isRecord(parsed.settings) ? parsed.settings : {}
  const settings = { ...defaultSettings }
  if (["hiragana", "katakana", "romaji"].includes(value.displayType as string))
    settings.displayType = value.displayType as KanaSettings["displayType"]
  if (
    ["all", "seion", "dakuon", "row", "column", "custom", "review"].includes(
      value.selectionMode as string
    )
  )
    settings.selectionMode =
      value.selectionMode as KanaSettings["selectionMode"]
  if (["flashcard", "input"].includes(value.practiceMode as string))
    settings.practiceMode = value.practiceMode as KanaSettings["practiceMode"]
  if ([0, 1, 3, 5].includes(value.roundCount as number))
    settings.roundCount = value.roundCount as number
  if (typeof value.isAuto === "boolean") settings.isAuto = value.isAuto
  if (
    typeof value.autoInterval === "number" &&
    Number.isInteger(value.autoInterval) &&
    value.autoInterval >= 1 &&
    value.autoInterval <= 10
  )
    settings.autoInterval = value.autoInterval
  settings.selectedRows = selectedValues(value.selectedRows, [
    ...rows,
    ...dakuonRows,
  ])
  settings.selectedColumns = selectedValues(value.selectedColumns, columns)
  const customIds = selectedValues(
    value.customSelected,
    kanaData.map(kana => kana.hiragana)
  )
  settings.customSelected = kanaData.filter(kana =>
    customIds.includes(kana.hiragana)
  )
  const mastery: Mastery = {}
  if (isRecord(parsed.mastery)) {
    for (const kana of kanaData) {
      const status = parsed.mastery[kana.hiragana]
      if (status === "known" || status === "learning")
        mastery[kana.hiragana] = status
    }
  }
  return { settings, mastery }
}

export function serializeSavedPractice(
  settings: KanaSettings,
  mastery: Mastery
): string {
  return JSON.stringify({
    version: 1,
    settings: {
      ...settings,
      customSelected: settings.customSelected.map(kana => kana.hiragana),
    },
    mastery,
  })
}
