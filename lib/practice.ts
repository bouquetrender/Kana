import {
  dakuonRows,
  kanaData,
  type KanaChar,
  type KanaSettings,
  type Mastery,
  type DisplayType,
} from "./kana-data"

export const defaultSettings: KanaSettings = {
  displayType: "hiragana",
  selectionMode: "all",
  selectedRows: [],
  selectedColumns: [],
  customSelected: [],
  isAuto: false,
  autoInterval: 3,
  practiceMode: "flashcard",
  roundCount: 1,
}

export const displayLabels = {
  hiragana: "平假名",
  katakana: "片假名",
  romaji: "罗马音",
}

export function filterKana(
  settings: KanaSettings,
  mastery: Mastery = {}
): KanaChar[] {
  switch (settings.selectionMode) {
    case "all":
      return kanaData
    case "seion":
      return kanaData.filter(kana => !dakuonRows.includes(kana.row))
    case "review":
      return kanaData.filter(kana => mastery[kana.hiragana] === "learning")
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

const romajiAliases: Record<string, string[]> = {
  し: ["si"],
  ち: ["ti"],
  つ: ["tu"],
  ふ: ["hu"],
  じ: ["zi"],
  ぢ: ["di", "zi"],
  づ: ["du"],
  を: ["o"],
  ん: ["nn", "n'"],
}

export function isCorrectAnswer(
  kana: KanaChar,
  displayType: DisplayType,
  answer: string
): boolean {
  const normalized = answer.normalize("NFKC").trim().toLowerCase()
  if (!normalized) return false
  if (displayType === "romaji") {
    return kanaData.some(
      candidate =>
        candidate.romaji === kana.romaji &&
        [candidate.hiragana, candidate.katakana].includes(normalized)
    )
  }
  return [kana.romaji, ...(romajiAliases[kana.hiragana] ?? [])].includes(
    normalized
  )
}

export type Outcome = "known" | "learning" | "correct" | "incorrect" | "skipped"
export interface PracticeResult {
  kana: KanaChar
  outcome: Outcome
  answer?: string
}

export interface PracticeSession {
  settings: KanaSettings
  pool: KanaChar[]
  deck: KanaChar[]
  index: number
  round: number
  results: PracticeResult[]
  currentResult: PracticeResult | null
  status: "active" | "completed"
  startedAt: number
  endedAt: number | null
  pausedAt: number | null
  pausedMs: number
}

export function createSession(
  settings: KanaSettings,
  pool: KanaChar[],
  deck: KanaChar[],
  now: number
): PracticeSession {
  return {
    settings: { ...settings },
    pool,
    deck,
    index: 0,
    round: 1,
    results: [],
    currentResult: null,
    status: "active",
    startedAt: now,
    endedAt: null,
    pausedAt: null,
    pausedMs: 0,
  }
}

export function sessionCardId(session: PracticeSession): string {
  return `${session.startedAt}-${session.round}-${session.index}`
}

export type PracticeAction =
  | { type: "start"; session: PracticeSession }
  | { type: "reset" }
  | { type: "next"; cardId: string; deck: KanaChar[]; now: number }
  | { type: "mark"; cardId: string; outcome: "known" | "learning" }
  | { type: "answer"; cardId: string; answer: string }
  | { type: "pause"; now: number }
  | { type: "finish"; now: number }

function completeSession(
  session: PracticeSession,
  results: PracticeResult[],
  now: number
): PracticeSession {
  return {
    ...session,
    results,
    currentResult: null,
    status: "completed",
    endedAt: now,
    pausedMs:
      session.pausedMs +
      (session.pausedAt === null ? 0 : now - session.pausedAt),
    pausedAt: null,
  }
}

export function practiceReducer(
  session: PracticeSession | null,
  action: PracticeAction
): PracticeSession | null {
  if (action.type === "reset") return null
  if (action.type === "start")
    return action.session.pool.length ? action.session : null
  if (!session || session.status === "completed") return session
  if ("cardId" in action && action.cardId !== sessionCardId(session))
    return session
  const kana = session.deck[session.index]
  switch (action.type) {
    case "mark":
      if (
        session.settings.practiceMode !== "flashcard" ||
        session.currentResult
      )
        return session
      return { ...session, currentResult: { kana, outcome: action.outcome } }
    case "answer":
      if (
        session.settings.practiceMode !== "input" ||
        session.currentResult ||
        !action.answer.trim()
      )
        return session
      return {
        ...session,
        currentResult: {
          kana,
          answer: action.answer.trim(),
          outcome: isCorrectAnswer(
            kana,
            session.settings.displayType,
            action.answer
          )
            ? "correct"
            : "incorrect",
        },
      }
    case "pause":
      return session.pausedAt === null
        ? { ...session, pausedAt: action.now }
        : {
            ...session,
            pausedMs: session.pausedMs + action.now - session.pausedAt,
            pausedAt: null,
          }
    case "finish":
      return completeSession(
        session,
        session.currentResult
          ? [...session.results, session.currentResult]
          : session.results,
        action.now
      )
    case "next": {
      const results = [
        ...session.results,
        session.currentResult ?? { kana, outcome: "skipped" as const },
      ]
      if (session.index + 1 < session.deck.length) {
        return {
          ...session,
          index: session.index + 1,
          results,
          currentResult: null,
        }
      }
      if (
        session.settings.roundCount > 0 &&
        session.round >= session.settings.roundCount
      ) {
        return completeSession(session, results, action.now)
      }
      return {
        ...session,
        deck: action.deck,
        index: 0,
        round: session.round + 1,
        results,
        currentResult: null,
      }
    }
  }
}

export function summarizeSession(session: PracticeSession) {
  const counts: Record<Outcome, number> = {
    known: 0,
    learning: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0,
  }
  const latest = new Map<string, PracticeResult>()
  for (const result of session.results) {
    counts[result.outcome]++
    if (result.outcome !== "skipped") latest.set(result.kana.hiragana, result)
  }
  return {
    counts,
    reviewKana: [...latest.values()]
      .filter(result => ["learning", "incorrect"].includes(result.outcome))
      .map(result => result.kana),
    elapsedSeconds: Math.max(
      0,
      Math.floor(
        ((session.endedAt ?? session.startedAt) -
          session.startedAt -
          session.pausedMs) /
          1000
      )
    ),
    accuracy:
      counts.correct + counts.incorrect > 0
        ? Math.round(
            (counts.correct / (counts.correct + counts.incorrect)) * 100
          )
        : null,
  }
}
