import { test } from "node:test"
import assert from "node:assert/strict"
import { kanaData, dakuonRows } from "../lib/kana-data"
import { defaultSettings, filterKana, shuffleKana } from "../lib/practice"

test("全部假名与浊音范围使用同一份数据", () => {
  assert.equal(filterKana(defaultSettings).length, 71)
  const voiced = filterKana({ ...defaultSettings, selectionMode: "dakuon" })
  assert.equal(voiced.length, 25)
  assert.ok(voiced.every(kana => dakuonRows.includes(kana.row)))
})

test("行与段筛选覆盖浊音和拨音，空选区不出题", () => {
  assert.equal(
    filterKana({ ...defaultSettings, selectionMode: "row" }).length,
    0
  )
  const row = filterKana({
    ...defaultSettings,
    selectionMode: "row",
    selectedRows: ["あ", "が"],
  })
  assert.equal(row.length, 10)
  assert.ok(row.every(kana => ["あ", "が"].includes(kana.row)))
  const column = filterKana({
    ...defaultSettings,
    selectionMode: "column",
    selectedColumns: ["ん"],
  })
  assert.deepEqual(
    column.map(kana => kana.hiragana),
    ["ん"]
  )
})

test("自定义范围按假名去重，保留 ji / zu 对应的不同字符", () => {
  const selected = kanaData.filter(kana => ["ji", "zu"].includes(kana.romaji))
  const pool = filterKana({
    ...defaultSettings,
    selectionMode: "custom",
    customSelected: [...selected, selected[0]],
  })
  assert.equal(pool.length, 4)
  assert.deepEqual(
    new Set(pool.map(kana => kana.hiragana)),
    new Set(["じ", "ぢ", "ず", "づ"])
  )
})

test("每轮出题完整、不重复且不修改源数据", () => {
  const original = [...kanaData]
  for (let round = 0; round < 100; round++) {
    const deck = shuffleKana(kanaData)
    assert.equal(deck.length, kanaData.length)
    assert.equal(new Set(deck.map(kana => kana.hiragana)).size, kanaData.length)
    assert.deepEqual(new Set(deck), new Set(kanaData))
  }
  assert.deepEqual(kanaData, original)
})

test("轮次交界避免连续重复，包括两张卡的范围", () => {
  for (const pool of [kanaData.slice(0, 2), kanaData]) {
    let previous = pool[0]
    for (let round = 0; round < 100; round++) {
      const deck = shuffleKana(pool, previous)
      assert.notEqual(deck[0].hiragana, previous.hiragana)
      previous = deck[deck.length - 1]
    }
  }
})

test("零张和单张范围正确处理", () => {
  assert.deepEqual(shuffleKana([]), [])
  assert.deepEqual(shuffleKana([kanaData[0]], kanaData[0]), [kanaData[0]])
})

test("清音范围包含 46 个假名和拨音，不包含浊音", () => {
  const pool = filterKana({ ...defaultSettings, selectionMode: "seion" })
  assert.equal(pool.length, 46)
  assert.ok(pool.some(kana => kana.hiragana === "ん"))
  assert.ok(pool.every(kana => !dakuonRows.includes(kana.row)))
})
