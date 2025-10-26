"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  kanaData,
  rows,
  columns,
  dakuonRows,
  type DisplayType,
  type SelectionMode,
  type KanaSettings,
} from "@/lib/kana-data"
import { useState, useRef, useCallback } from "react"

interface SettingsPanelProps {
  settings: KanaSettings
  onSettingsChange: (settings: KanaSettings) => void
  onStart: () => void
}

interface SelectionBox {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function SettingsPanel({ settings, onSettingsChange, onStart }: SettingsPanelProps) {
  const [showCustomGrid, setShowCustomGrid] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null)
  const [isDragging, setIsDragging] = useState(false) // 用于区分点击和拖拽
  const gridRef = useRef<HTMLDivElement>(null)
  
  const updateSettings = (updates: Partial<KanaSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  // 开始拖拽选择
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 允许从任何地方开始拖拽（包括按钮上）
    if (!gridRef.current) return
    
    const rect = gridRef.current.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top
    
    setIsSelecting(true)
    setIsDragging(false) // 初始时不是拖拽状态
    setSelectionBox({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    })
  }, [])

  // 拖拽中
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selectionBox || !gridRef.current) return
    
    const rect = gridRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    // 检测是否真的在拖拽（移动超过5px才算拖拽）
    const deltaX = Math.abs(currentX - selectionBox.startX)
    const deltaY = Math.abs(currentY - selectionBox.startY)
    
    if (deltaX > 5 || deltaY > 5) {
      setIsDragging(true)
    }
    
    setSelectionBox({
      ...selectionBox,
      currentX,
      currentY,
    })
  }, [isSelecting, selectionBox])

  // 结束拖拽选择
  const handleMouseUp = useCallback(() => {
    if (!isSelecting || !selectionBox || !gridRef.current) return
    
    // 只有真正拖拽了才执行选择逻辑（避免单击时触发）
    if (isDragging) {
      // 计算选择框的实际坐标
      const left = Math.min(selectionBox.startX, selectionBox.currentX)
      const right = Math.max(selectionBox.startX, selectionBox.currentX)
      const top = Math.min(selectionBox.startY, selectionBox.currentY)
      const bottom = Math.max(selectionBox.startY, selectionBox.currentY)
      
      // 找出所有与选择框重叠的按钮
      const dragSelectedKeys: string[] = []
      const buttons = gridRef.current.querySelectorAll('button[data-key]')
      const gridRect = gridRef.current.getBoundingClientRect()
      
      buttons.forEach((button) => {
        const buttonRect = button.getBoundingClientRect()
        const buttonLeft = buttonRect.left - gridRect.left
        const buttonRight = buttonRect.right - gridRect.left
        const buttonTop = buttonRect.top - gridRect.top
        const buttonBottom = buttonRect.bottom - gridRect.top
        
        // 检查是否重叠
        const isOverlapping = 
          buttonLeft < right &&
          buttonRight > left &&
          buttonTop < bottom &&
          buttonBottom > top
        
        if (isOverlapping) {
          const key = button.getAttribute('data-key')
          if (key) {
            dragSelectedKeys.push(key)
          }
        }
      })
      
      // 添加选择：保留已选中的，添加新选中的（不反选）
      if (dragSelectedKeys.length > 0) {
        const currentSelectedSet = new Set(settings.customSelected.map(k => k.hiragana))
        
        // 将拖拽选中的假名都添加到选择集合中（已选中的保持选中）
        dragSelectedKeys.forEach(key => {
          currentSelectedSet.add(key)
        })
        
        // 更新选中的假名
        const newSelectedKana = kanaData.filter((k) => currentSelectedSet.has(k.hiragana))
        updateSettings({ customSelected: newSelectedKana })
      }
    }
    
    setIsSelecting(false)
    setIsDragging(false)
    setSelectionBox(null)
  }, [isSelecting, isDragging, selectionBox, settings.customSelected, updateSettings])

  // 渲染选择框
  const renderSelectionBox = () => {
    if (!isSelecting || !selectionBox || !isDragging) return null
    
    const left = Math.min(selectionBox.startX, selectionBox.currentX)
    const top = Math.min(selectionBox.startY, selectionBox.currentY)
    const width = Math.abs(selectionBox.currentX - selectionBox.startX)
    const height = Math.abs(selectionBox.currentY - selectionBox.startY)
    
    return (
      <div
        className="absolute pointer-events-none z-50 transition-opacity"
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: '2px solid hsl(var(--primary))',
          background: 'hsl(var(--primary) / 0.15)',
          borderRadius: '6px',
          boxShadow: '0 0 0 1px hsl(var(--primary) / 0.3), 0 4px 12px hsl(var(--primary) / 0.2)',
        }}
      />
    )
  }

  const toggleKanaSelection = (kana: typeof kanaData[0]) => {
    const isSelected = settings.customSelected.some(
      k => k.hiragana === kana.hiragana
    )

    if (isSelected) {
      updateSettings({
        customSelected: settings.customSelected.filter(
          k => k.hiragana !== kana.hiragana
        )
      })
    } else {
      updateSettings({
        customSelected: [...settings.customSelected, kana]
      })
    }
  }

  const toggleRow = (row: string) => {
    if (settings.selectedRows.includes(row)) {
      updateSettings({
        selectedRows: settings.selectedRows.filter(r => r !== row)
      })
    } else {
      updateSettings({
        selectedRows: [...settings.selectedRows, row]
      })
    }
  }

  const toggleColumn = (column: string) => {
    if (settings.selectedColumns.includes(column)) {
      updateSettings({
        selectedColumns: settings.selectedColumns.filter(c => c !== column)
      })
    } else {
      updateSettings({
        selectedColumns: [...settings.selectedColumns, column]
      })
    }
  }

  const getFilteredKana = () => {
    if (settings.selectionMode === "all") {
      return kanaData
    } else if (settings.selectionMode === "dakuon") {
      return kanaData.filter(k => dakuonRows.includes(k.row))
    } else if (settings.selectionMode === "row") {
      return kanaData.filter(k => settings.selectedRows.includes(k.row))
    } else if (settings.selectionMode === "column") {
      return kanaData.filter(k => settings.selectedColumns.includes(k.column))
    } else {
      return settings.customSelected
    }
  }

  const canStart = getFilteredKana().length > 0

  return (
    <Card className="w-full max-w-2xl">
      <div className="flex flex-col space-y-1.5 p-6 pb-2">
        <h3 className="text-2xl font-bold tracking-tight">初始化</h3>
        <div className="text-sm">配置假名练习</div>
      </div>
      <div className="p-6 pt-2">
        {/* 显示类型 */}
        <div className="space-y-2">
          <Label className="mb-2 inline-block">显示类型</Label>
          <Select
            value={settings.displayType}
            onValueChange={(value) => updateSettings({ displayType: value as DisplayType })}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择显示类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hiragana">平假名</SelectItem>
              <SelectItem value="katakana">片假名</SelectItem>
              <SelectItem value="romaji">罗马音</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 选择模式 */}
        <div className="space-y-2 mt-3">
          <Label className="mb-2 inline-block">选择范围</Label>
          <Select
            value={settings.selectionMode}
            onValueChange={(value) => {
              const mode = value as SelectionMode
              updateSettings({ selectionMode: mode })
              setShowCustomGrid(mode === "custom")
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部假名</SelectItem>
              <SelectItem value="dakuon">浊音/半浊音</SelectItem>
              <SelectItem value="row">按行选择（横向）</SelectItem>
              <SelectItem value="column">按段选择（竖向）</SelectItem>
              <SelectItem value="custom">自定义选择</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 行选择 */}
        {settings.selectionMode === "row" && (
          <div className="space-y-2 mt-3">
            <Label>选择行</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {rows.map(row => (
                <Button
                  key={row}
                  type="button"
                  variant={settings.selectedRows.includes(row) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleRow(row)}
                >
                  {row}行
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 段选择 */}
        {settings.selectionMode === "column" && (
          <div className="space-y-2 mt-3">
            <Label>选择段</Label>
            <div className="flex flex-wrap gap-2">
              {columns.map(column => (
                <Button
                  className="mt-1"
                  key={column}
                  type="button"
                  variant={settings.selectedColumns.includes(column) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleColumn(column)}
                >
                  {column}段
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 自定义选择网格 */}
        {settings.selectionMode === "custom" && (
          <div className="space-y-2 mt-3">
            <Label>点击或拖拽选择假名</Label>
            <div
              ref={gridRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="mb-1 mt-1 grid grid-cols-5 gap-1 sm:gap-2 p-2 rounded-md border border-dashed relative select-none"
              style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
            >
              {renderSelectionBox()}
              {/* 按行段结构展示 */}
              {[...rows, ...dakuonRows].map(row => {
                return columns.filter(col => col !== "ん").map(col => {
                  // 查找对应行段的假名
                  const kana = kanaData.find(k => k.row === row && k.column === col)
                  
                  if (!kana) {
                    // 空位置，渲染一个不可见的占位元素
                    return (
                      <div
                        key={`${row}-${col}-empty`}
                        className="h-9 sm:h-10"
                      />
                    )
                  }
                  
                  const isSelected = settings.customSelected.some(
                    k => k.hiragana === kana.hiragana
                  )
                  
                  return (
                    <Button
                      key={kana.hiragana}
                      data-key={kana.hiragana}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleKanaSelection(kana)}
                      className="text-xs sm:text-s mt-1 cursor-pointer z-10 relative"
                    >
                      {kana.hiragana}
                    </Button>
                  )
                })
              })}
              {/* ん单独处理 */}
              {(() => {
                const nKana = kanaData.find(k => k.hiragana === "ん")
                if (!nKana) return null
                
                const isSelected = settings.customSelected.some(
                  k => k.hiragana === nKana.hiragana
                )
                
                return (
                  <Button
                    key={nKana.hiragana}
                    data-key={nKana.hiragana}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleKanaSelection(nKana)}
                    className="text-xs sm:text-s mt-1 cursor-pointer z-10 relative"
                  >
                    {nKana.hiragana}
                  </Button>
                )
              })()}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground/60">
                已选择：{settings.customSelected.length} 个假名
              </p>
              {settings.customSelected.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => updateSettings({ customSelected: [] })}
                  className="text-xs h-7"
                >
                  清空重选
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="space-y-0.5">
            <Label>自动切换</Label>
            <p className="text-xs text-foreground/60">自动切换到下一个假名</p>
          </div>
          <Switch
            checked={settings.isAuto}
            onCheckedChange={(checked) => updateSettings({ isAuto: checked })}
          />
        </div>

        {/* 自动间隔 */}
        {settings.isAuto && (
          <div className="mt-4">
            <Label>间隔时间：{settings.autoInterval} 秒</Label>
            <Slider
              className="mt-2 mb-2"
              min={1}
              max={10}
              step={1}
              defaultValue={[settings.autoInterval]}
              onValueChange={(value) => updateSettings({ autoInterval: value[0] })}
            />
          </div>
        )}

        {/* 开始按钮 */}
        <Button
          onClick={onStart}
          disabled={!canStart}
          className="w-full mt-4"
          size="lg"
        >
          开始练习 {canStart && `(${getFilteredKana().length} 个假名)`}
        </Button>
      </div>
    </Card>
  )
}

