import {
  dakuonRows,
  kanaData,
  type KanaChar,
  type KanaSettings,
} from "./kana-data"

export const defaultSettings: KanaSettings = {
  displayType: "hiragana",
  selectionMode: "all",
  selectedRows: [],
  selectedColumns: [],
  customSelected: [],
  isAuto: false,
  autoInterval: 3,
}

export const displayLabels = {
  hiragana: "平假名",
  katakana: "片假名",
  romaji: "罗马音",
}

export function filterKana(settings: KanaSettings): KanaChar[] {
  switch (settings.selectionMode) {
    case "all":
      return kanaData
    case "dakuon":
      return kanaData.filter(kana => dakuonRows.includes(kana.row))
    case "row":
      return kanaData.filter(kana => settings.selectedRows.includes(kana.row))
    case "column":
      return kanaData.filter(kana =>
        settings.selectedColumns.includes(kana.column)
      )
    case "custom":
      return kanaData.filter(kana =>
        settings.customSelected.some(
          selected => selected.hiragana === kana.hiragana
        )
      )
  }
}

// 每轮完整洗牌；新一轮的首张避免与上一轮末张重复。
export function shuffleKana(pool: KanaChar[], previous?: KanaChar): KanaChar[] {
  const deck = [...pool]
  for (let index = deck.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[deck[index], deck[randomIndex]] = [deck[randomIndex], deck[index]]
  }
  if (deck.length > 1 && deck[0].hiragana === previous?.hiragana) {
    const nextIndex = 1 + Math.floor(Math.random() * (deck.length - 1))
    ;[deck[0], deck[nextIndex]] = [deck[nextIndex], deck[0]]
  }
  return deck
}
