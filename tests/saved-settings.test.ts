import { test } from "node:test"
import assert from "node:assert/strict"
import { kanaData } from "../lib/kana-data"
import { defaultSettings } from "../lib/practice"
import {
  restoreSavedPractice,
  serializeSavedPractice,
} from "../lib/saved-settings"

test("所有练习设置和掌握标记可以完整恢复", () => {
  const settings = {
    ...defaultSettings,
    displayType: "katakana" as const,
    selectionMode: "custom" as const,
    selectedRows: ["あ", "が"],
    selectedColumns: ["い"],
    customSelected: kanaData.slice(0, 3),
    practiceMode: "input" as const,
    roundCount: 5,
    isAuto: true,
    autoInterval: 7,
  }
  const mastery = { あ: "known" as const, い: "learning" as const }
  assert.deepEqual(
    restoreSavedPractice(serializeSavedPractice(settings, mastery)),
    { settings, mastery }
  )
})

test("缺失、损坏或不支持的存档使用默认设置", () => {
  for (const raw of [null, "{", "[]", "null", '{"version":99}']) {
    assert.deepEqual(restoreSavedPractice(raw), {
      settings: defaultSettings,
      mastery: {},
    })
  }
})

test("无效字段回退，清理未知或重复假名", () => {
  const saved = restoreSavedPractice(
    JSON.stringify({
      version: 1,
      settings: {
        displayType: "invalid",
        practiceMode: "invalid",
        selectionMode: "invalid",
        autoInterval: -5,
        roundCount: 500,
        isAuto: "true",
        selectedRows: ["bad", "あ", "あ"],
        customSelected: ["あ", "あ", "bad"],
      },
      mastery: { あ: "learning", い: "invalid", bad: "known" },
    })
  )
  assert.equal(saved.settings.autoInterval, 3)
  assert.equal(saved.settings.roundCount, 1)
  assert.equal(saved.settings.isAuto, false)
  assert.equal(saved.settings.practiceMode, "flashcard")
  assert.deepEqual(saved.settings.selectedRows, ["あ"])
  assert.deepEqual(saved.settings.customSelected, [kanaData[0]])
  assert.deepEqual(saved.mastery, { あ: "learning" })
})
