import { test } from "node:test"
import assert from "node:assert/strict"
import { kanaData } from "../lib/kana-data"
import {
  createSession,
  defaultSettings,
  filterKana,
  isCorrectAnswer,
  practiceReducer,
  sessionCardId,
  summarizeSession,
  type PracticeSession,
} from "../lib/practice"

const pool = kanaData.slice(0, 2)
const next = (session: PracticeSession, now = 4000) =>
  practiceReducer(session, {
    type: "next",
    cardId: sessionCardId(session),
    deck: [...pool].reverse(),
    now,
  })!

test("有限轮次在最后一题完成后结束，未标记不算认识", () => {
  let session = createSession(defaultSettings, pool, pool, 1000)
  session = practiceReducer(session, {
    type: "mark",
    cardId: sessionCardId(session),
    outcome: "known",
  })!
  session = next(session)
  assert.equal(session.status, "active")
  session = next(session, 6000)
  assert.equal(session.status, "completed")
  const summary = summarizeSession(session)
  assert.equal(summary.counts.known, 1)
  assert.equal(summary.counts.skipped, 1)
  assert.equal(summary.elapsedSeconds, 5)
})

test("三轮共六题；无限模式不自动结束", () => {
  let session = createSession(
    { ...defaultSettings, roundCount: 3 },
    pool,
    pool,
    1000
  )
  for (let index = 0; index < 5; index++) session = next(session)
  assert.equal(session.status, "active")
  assert.equal(session.round, 3)
  session = next(session)
  assert.equal(session.status, "completed")
  assert.equal(session.results.length, 6)
  session = createSession(
    { ...defaultSettings, roundCount: 0 },
    pool,
    pool,
    1000
  )
  for (let index = 0; index < 12; index++) session = next(session)
  assert.equal(session.status, "active")
  assert.equal(session.round, 7)
})

test("过期切题和重复判题事件不会重复记录", () => {
  const initial = createSession(
    { ...defaultSettings, practiceMode: "input" },
    pool,
    pool,
    1000
  )
  const answer = {
    type: "answer" as const,
    cardId: sessionCardId(initial),
    answer: "a",
  }
  const answered = practiceReducer(initial, answer)!
  assert.equal(answered.currentResult?.outcome, "correct")
  assert.equal(
    practiceReducer(answered, { ...answer, answer: "wrong" }),
    answered
  )
  const advanced = next(answered)
  assert.equal(
    practiceReducer(advanced, {
      type: "next",
      cardId: sessionCardId(initial),
      deck: pool,
      now: 5000,
    }),
    advanced
  )
  const ended = next(advanced)
  assert.equal(practiceReducer(ended, answer), ended)
})

test("提前结束只记录已判定的当前题，正确率排除跳过", () => {
  let session = createSession(
    { ...defaultSettings, practiceMode: "input" },
    pool,
    pool,
    1000
  )
  session = next(session)
  session = practiceReducer(session, {
    type: "answer",
    cardId: sessionCardId(session),
    answer: "i",
  })!
  session = practiceReducer(session, { type: "finish", now: 6000 })!
  const summary = summarizeSession(session)
  assert.equal(session.results.length, 2)
  assert.equal(summary.counts.correct, 1)
  assert.equal(summary.counts.skipped, 1)
  assert.equal(summary.accuracy, 100)
  const empty = practiceReducer(
    createSession(defaultSettings, pool, pool, 1000),
    { type: "finish", now: 2000 }
  )!
  assert.equal(empty.results.length, 0)
  assert.equal(summarizeSession(empty).accuracy, null)
})

test("用时排除暂停时间，暂停中结束也不会多计", () => {
  let session = createSession(defaultSettings, pool, pool, 1000)
  session = practiceReducer(session, { type: "pause", now: 3000 })!
  session = practiceReducer(session, { type: "pause", now: 8000 })!
  session = practiceReducer(session, { type: "pause", now: 10000 })!
  session = practiceReducer(session, { type: "finish", now: 15000 })!
  assert.equal(summarizeSession(session).elapsedSeconds, 4)
})

test("复习范围与本轮题库独立，最新标记决定待复习列表", () => {
  const settings = {
    ...defaultSettings,
    selectionMode: "review" as const,
    roundCount: 3,
  }
  const selection = filterKana(settings, { あ: "learning" })
  let session = createSession(settings, selection, selection, 1000)
  session = practiceReducer(session, {
    type: "mark",
    cardId: sessionCardId(session),
    outcome: "learning",
  })!
  session = practiceReducer(session, {
    type: "next",
    cardId: sessionCardId(session),
    deck: selection,
    now: 2000,
  })!
  session = practiceReducer(session, {
    type: "mark",
    cardId: sessionCardId(session),
    outcome: "known",
  })!
  session = practiceReducer(session, { type: "finish", now: 4000 })!
  assert.equal(filterKana(settings, { あ: "known" }).length, 0)
  assert.equal(session.pool.length, 1)
  assert.equal(summarizeSession(session).reviewKana.length, 0)
})

test("罗马音判题支持大小写、全角和常见拼写，不接受空答案", () => {
  const shi = kanaData.find(kana => kana.hiragana === "し")!
  for (const answer of ["shi", "SI", " ＳＨＩ "])
    assert.ok(isCorrectAnswer(shi, "hiragana", answer))
  for (const answer of ["", " ", "chi", "し"])
    assert.equal(isCorrectAnswer(shi, "katakana", answer), false)
  const session = createSession(
    { ...defaultSettings, practiceMode: "input" },
    pool,
    pool,
    1000
  )
  assert.equal(
    practiceReducer(session, {
      type: "answer",
      cardId: sessionCardId(session),
      answer: " ",
    }),
    session
  )
})

test("罗马音题目接受对应平片假名，兼容同音字符", () => {
  const ji = kanaData.find(kana => kana.hiragana === "じ")!
  for (const answer of ["じ", "ジ", "ぢ", "ヂ", "ｼﾞ"])
    assert.ok(isCorrectAnswer(ji, "romaji", answer))
  for (const answer of ["し", "ji", "ず"])
    assert.equal(isCorrectAnswer(ji, "romaji", answer), false)
})

test("错误答案进入复习列表，跳过不覆盖之前的标记", () => {
  let session = createSession(
    { ...defaultSettings, practiceMode: "input", roundCount: 3 },
    [pool[0]],
    [pool[0]],
    1000
  )
  session = practiceReducer(session, {
    type: "answer",
    cardId: sessionCardId(session),
    answer: "wrong",
  })!
  session = practiceReducer(session, {
    type: "next",
    cardId: sessionCardId(session),
    deck: [pool[0]],
    now: 2000,
  })!
  session = practiceReducer(session, {
    type: "next",
    cardId: sessionCardId(session),
    deck: [pool[0]],
    now: 3000,
  })!
  session = practiceReducer(session, { type: "finish", now: 4000 })!
  assert.deepEqual(summarizeSession(session).reviewKana, [pool[0]])
  assert.equal(summarizeSession(session).counts.incorrect, 1)
})
