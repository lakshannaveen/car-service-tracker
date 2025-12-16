import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCost } from "@/utils"

interface TotalCostFieldProps {
  displayedCost: number
  isLoading: boolean
  hasBreakdowns?: boolean
}

export function TotalCostField({ displayedCost, isLoading, hasBreakdowns }: TotalCostFieldProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="cost" className="text-sm font-medium">
        Total Cost *
      </Label>
      <Input
        id="cost"
        type="text"
        value={`LKR ${formatCost(displayedCost || 0)}`}
        readOnly
        disabled={isLoading}
        className="h-11 transition-colors bg-muted/60 dark:bg-slate-800 border border-border text-sm font-semibold"
      />
      <p className="text-xs text-muted-foreground">
        {hasBreakdowns
          ? "Auto-calculated from cost breakdown items (not editable)"
          : "Total cost is derived. Add cost breakdown items to update it."}
      </p>
    </div>
  )
}
