"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play, Pause, Eye, EyeOff } from "lucide-react"
import { type KanaChar, type DisplayType } from "@/lib/kana-data"

interface PracticePanelProps {
  currentKana: KanaChar | null
  displayType: DisplayType
  isAuto: boolean
  isPaused: boolean
  onNext: () => void
  onReset: () => void
  onTogglePause: () => void
}

export function PracticePanel({
  currentKana,
  displayType,
  isAuto,
  isPaused,
  onNext,
  onReset,
  onTogglePause,
}: PracticePanelProps) {
  const [showHint, setShowHint] = useState(false)
  const [hintContent, setHintContent] = useState<KanaChar | null>(null)

  useEffect(() => {
    setShowHint(false)
  }, [currentKana])

  if (!currentKana) return null

  const getDisplayText = () => {
    switch (displayType) {
      case "hiragana":
        return currentKana.hiragana
      case "katakana":
        return currentKana.katakana
      case "romaji":
        return currentKana.romaji
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -margin-top-10 gap-4">
      {/* 假名显示区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentKana.hiragana}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-[420px] md:h-[470px] text-[22rem] md:text-[24rem] lg:text-[24rem] font-bold selecFt-none antialiase -mt-38"
        >
          {getDisplayText()}
        </motion.div>
      </AnimatePresence>

      {/* 提示/答案区域 */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence onExitComplete={() => setHintContent(null)}>
          {showHint && hintContent && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center gap-6 text-3xl md:text-4xl text-foreground/80"
            >
              {displayType !== "hiragana" && <p>{hintContent.hiragana}</p>}
              {displayType !== "katakana" && <p>{hintContent.katakana}</p>}
              {displayType !== "romaji" && <p>{hintContent.romaji}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 控制按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Button
          onClick={() => {
            if (showHint) {
              setShowHint(false)
            } else {
              setHintContent(currentKana)
              setShowHint(true)
            }
          }}
          size="lg"
          variant="outline"
          className="gap-2 cursor-pointer"
        >
          {showHint ? (
            <>
              <EyeOff className="w-5 h-5" />
              隐藏提示
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              显示提示
            </>
          )}
        </Button>
        {isAuto && (
          <Button
            onClick={onTogglePause}
            size="lg"
            variant="outline"
            className="gap-2 cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-5 h-5" />
                继续
              </>
            ) : (
              <>
                <Pause className="w-5 h-5" />
                暂停
              </>
            )}
          </Button>
        )}

        {!isAuto && (
          <Button
            onClick={onNext}
            size="lg"
            className="gap-2 cursor-pointer"
          >
            下一个
          </Button>
        )}

        <Button
          onClick={onReset}
          size="lg"
          variant="destructive"
          className="gap-2 cursor-pointer"
        >
          重新开始
        </Button>
      </motion.div>

      {/* 提示信息 */}
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-foreground/60 text-center"
      >
        {displayType === "hiragana" && "平假名模式"}
        {displayType === "katakana" && "片假名模式"}
        {displayType === "romaji" && "罗马音模式"}
      </motion.div> */}
    </div>
  )
}

