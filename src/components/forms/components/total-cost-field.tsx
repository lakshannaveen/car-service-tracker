import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCost } from "@/utils"

interface TotalCostFieldProps {
  displayedCost: number
  isLoading: boolean
}

export function TotalCostField({ displayedCost, isLoading }: TotalCostFieldProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="cost" className="text-sm font-medium">
        Total Cost *
      </Label>
      <Input
        id="cost"
        type="text"
        placeholder="0.00"
        value={formatCost(displayedCost)}
        required
        disabled={isLoading}
        className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
        readOnly
      />
      <p className="text-xs text-muted-foreground">Total cost is auto-calculated from cost items and not editable</p>
    </div>
  )
}
