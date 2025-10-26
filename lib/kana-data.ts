export interface KanaChar {
  hiragana: string;
  katakana: string;
  romaji: string;
  row: string; // 行 (横着)
  column: string; // 段 (竖着)
}

export const kanaData: KanaChar[] = [
  // あ行
  { hiragana: "あ", katakana: "ア", romaji: "a", row: "あ", column: "あ" },
  { hiragana: "い", katakana: "イ", romaji: "i", row: "あ", column: "い" },
  { hiragana: "う", katakana: "ウ", romaji: "u", row: "あ", column: "う" },
  { hiragana: "え", katakana: "エ", romaji: "e", row: "あ", column: "え" },
  { hiragana: "お", katakana: "オ", romaji: "o", row: "あ", column: "お" },
  
  // か行
  { hiragana: "か", katakana: "カ", romaji: "ka", row: "か", column: "あ" },
  { hiragana: "き", katakana: "キ", romaji: "ki", row: "か", column: "い" },
  { hiragana: "く", katakana: "ク", romaji: "ku", row: "か", column: "う" },
  { hiragana: "け", katakana: "ケ", romaji: "ke", row: "か", column: "え" },
  { hiragana: "こ", katakana: "コ", romaji: "ko", row: "か", column: "お" },
  
  // さ行
  { hiragana: "さ", katakana: "サ", romaji: "sa", row: "さ", column: "あ" },
  { hiragana: "し", katakana: "シ", romaji: "shi", row: "さ", column: "い" },
  { hiragana: "す", katakana: "ス", romaji: "su", row: "さ", column: "う" },
  { hiragana: "せ", katakana: "セ", romaji: "se", row: "さ", column: "え" },
  { hiragana: "そ", katakana: "ソ", romaji: "so", row: "さ", column: "お" },
  
  // た行
  { hiragana: "た", katakana: "タ", romaji: "ta", row: "た", column: "あ" },
  { hiragana: "ち", katakana: "チ", romaji: "chi", row: "た", column: "い" },
  { hiragana: "つ", katakana: "ツ", romaji: "tsu", row: "た", column: "う" },
  { hiragana: "て", katakana: "テ", romaji: "te", row: "た", column: "え" },
  { hiragana: "と", katakana: "ト", romaji: "to", row: "た", column: "お" },
  
  // な行
  { hiragana: "な", katakana: "ナ", romaji: "na", row: "な", column: "あ" },
  { hiragana: "に", katakana: "ニ", romaji: "ni", row: "な", column: "い" },
  { hiragana: "ぬ", katakana: "ヌ", romaji: "nu", row: "な", column: "う" },
  { hiragana: "ね", katakana: "ネ", romaji: "ne", row: "な", column: "え" },
  { hiragana: "の", katakana: "ノ", romaji: "no", row: "な", column: "お" },
  
  // は行
  { hiragana: "は", katakana: "ハ", romaji: "ha", row: "は", column: "あ" },
  { hiragana: "ひ", katakana: "ヒ", romaji: "hi", row: "は", column: "い" },
  { hiragana: "ふ", katakana: "フ", romaji: "fu", row: "は", column: "う" },
  { hiragana: "へ", katakana: "ヘ", romaji: "he", row: "は", column: "え" },
  { hiragana: "ほ", katakana: "ホ", romaji: "ho", row: "は", column: "お" },
  
  // ま行
  { hiragana: "ま", katakana: "マ", romaji: "ma", row: "ま", column: "あ" },
  { hiragana: "み", katakana: "ミ", romaji: "mi", row: "ま", column: "い" },
  { hiragana: "む", katakana: "ム", romaji: "mu", row: "ま", column: "う" },
  { hiragana: "め", katakana: "メ", romaji: "me", row: "ま", column: "え" },
  { hiragana: "も", katakana: "モ", romaji: "mo", row: "ま", column: "お" },
  
  // や行
  { hiragana: "や", katakana: "ヤ", romaji: "ya", row: "や", column: "あ" },
  { hiragana: "ゆ", katakana: "ユ", romaji: "yu", row: "や", column: "う" },
  { hiragana: "よ", katakana: "ヨ", romaji: "yo", row: "や", column: "お" },
  
  // ら行
  { hiragana: "ら", katakana: "ラ", romaji: "ra", row: "ら", column: "あ" },
  { hiragana: "り", katakana: "リ", romaji: "ri", row: "ら", column: "い" },
  { hiragana: "る", katakana: "ル", romaji: "ru", row: "ら", column: "う" },
  { hiragana: "れ", katakana: "レ", romaji: "re", row: "ら", column: "え" },
  { hiragana: "ろ", katakana: "ロ", romaji: "ro", row: "ら", column: "お" },
  
  // わ行
  { hiragana: "わ", katakana: "ワ", romaji: "wa", row: "わ", column: "あ" },
  { hiragana: "を", katakana: "ヲ", romaji: "wo", row: "わ", column: "お" },
  { hiragana: "ん", katakana: "ン", romaji: "n", row: "わ", column: "ん" },

  // が行 (浊音)
  { hiragana: "が", katakana: "ガ", romaji: "ga", row: "が", column: "あ" },
  { hiragana: "ぎ", katakana: "ギ", romaji: "gi", row: "が", column: "い" },
  { hiragana: "ぐ", katakana: "グ", romaji: "gu", row: "が", column: "う" },
  { hiragana: "げ", katakana: "ゲ", romaji: "ge", row: "が", column: "え" },
  { hiragana: "ご", katakana: "ゴ", romaji: "go", row: "が", column: "お" },
  
  // ざ行 (浊音)
  { hiragana: "ざ", katakana: "ザ", romaji: "za", row: "ざ", column: "あ" },
  { hiragana: "じ", katakana: "ジ", romaji: "ji", row: "ざ", column: "い" },
  { hiragana: "ず", katakana: "ズ", romaji: "zu", row: "ざ", column: "う" },
  { hiragana: "ぜ", katakana: "ゼ", romaji: "ze", row: "ざ", column: "え" },
  { hiragana: "ぞ", katakana: "ゾ", romaji: "zo", row: "ざ", column: "お" },
  
  // だ行 (浊音)
  { hiragana: "だ", katakana: "ダ", romaji: "da", row: "だ", column: "あ" },
  { hiragana: "ぢ", katakana: "ヂ", romaji: "ji", row: "だ", column: "い" },
  { hiragana: "づ", katakana: "ヅ", romaji: "zu", row: "だ", column: "う" },
  { hiragana: "で", katakana: "デ", romaji: "de", row: "だ", column: "え" },
  { hiragana: "ど", katakana: "ド", romaji: "do", row: "だ", column: "お" },
  
  // ば行 (浊音)
  { hiragana: "ば", katakana: "バ", romaji: "ba", row: "ば", column: "あ" },
  { hiragana: "び", katakana: "ビ", romaji: "bi", row: "ば", column: "い" },
  { hiragana: "ぶ", katakana: "ブ", romaji: "bu", row: "ば", column: "う" },
  { hiragana: "べ", katakana: "ベ", romaji: "be", row: "ば", column: "え" },
  { hiragana: "ぼ", katakana: "ボ", romaji: "bo", row: "ば", column: "お" },
  
  // ぱ行 (半浊音)
  { hiragana: "ぱ", katakana: "パ", romaji: "pa", row: "ぱ", column: "あ" },
  { hiragana: "ぴ", katakana: "ピ", romaji: "pi", row: "ぱ", column: "い" },
  { hiragana: "ぷ", katakana: "プ", romaji: "pu", row: "ぱ", column: "う" },
  { hiragana: "ぺ", katakana: "ペ", romaji: "pe", row: "ぱ", column: "え" },
  { hiragana: "ぽ", katakana: "ポ", romaji: "po", row: "ぱ", column: "お" },
];

export const rows = ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ"];
export const columns = ["あ", "い", "う", "え", "お", "ん"];
export const dakuonRows = ["が", "ざ", "だ", "ば", "ぱ"];

export type DisplayType = "hiragana" | "katakana" | "romaji";
export type SelectionMode = "all" | "row" | "column" | "custom" | "dakuon";

export interface KanaSettings {
  displayType: DisplayType;
  selectionMode: SelectionMode;
  selectedRows: string[];
  selectedColumns: string[];
  customSelected: KanaChar[];
  isAuto: boolean;
  autoInterval: number; // 秒
}

