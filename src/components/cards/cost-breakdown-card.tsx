import type { CostBreakdown } from "@/services"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface CostBreakdownCardProps {
  breakdown: CostBreakdown
  index: number
  onEdit: (index: number) => void
  onDelete: (index: number) => void
  formatCost: (value: number) => string
}

export function CostBreakdownCard({ breakdown, index, onEdit, onDelete, formatCost }: CostBreakdownCardProps) {
  return (
    <div className="border-2 border-muted/30 rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{breakdown.itemDescription}</h4>
          <Badge 
            variant="outline" 
            className={`mt-2 text-xs
              ${breakdown.itemCategory === "Labor" ? "border-blue-200 bg-blue-50 text-blue-700" :
                breakdown.itemCategory === "Parts" ? "border-green-200 bg-green-50 text-green-700" :
                breakdown.itemCategory === "Fluids" ? "border-purple-200 bg-purple-50 text-purple-700" :
                "border-gray-200 bg-gray-50 text-gray-700"}
            `}
          >
            {breakdown.itemCategory}
          </Badge>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(index)}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(index)}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 pt-2 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Qty</p>
          <p className="text-sm font-medium">{breakdown.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Unit Price</p>
          <p className="text-sm font-medium">{formatCost(breakdown.unitPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-semibold text-primary">{formatCost(breakdown.totalPrice || 0)}</p>
        </div>
      </div>
    </div>
  )
}
