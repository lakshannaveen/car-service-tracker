import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCost, parseFormattedNumber } from "@/utils"
import { useState } from "react"

interface TotalCostFieldProps {
  displayedCost: number
  isLoading: boolean
  onChange?: (value: number) => void
  hasBreakdowns?: boolean
}

export function TotalCostField({ displayedCost, isLoading, onChange, hasBreakdowns }: TotalCostFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [inputValue, setInputValue] = useState<string>("")

  return (
    <div className="space-y-3">
      <Label htmlFor="cost" className="text-sm font-medium">
        Total Cost *
      </Label>
      <Input
        id="cost"
        type="number"
        placeholder="0.00"
        step="0.01"
        min="0"
        value={isFocused ? inputValue : displayedCost.toFixed(2)}
        onFocus={(e) => {
          setIsFocused(true)
          setInputValue(displayedCost.toFixed(2))
          e.target.select()
        }}
        onBlur={(e) => {
          setIsFocused(false)
          const numValue = parseFloat(e.target.value) || 0
          onChange?.(Math.max(0, numValue))
        }}
        onChange={(e) => {
          setInputValue(e.target.value)
        }}
        required
        disabled={isLoading}
        className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
      />
      <p className="text-xs text-muted-foreground">
        {hasBreakdowns ? "Cost is auto-calculated from items, but you can also edit manually" : "Enter total service cost"}
      </p>
    </div>
  )
}
