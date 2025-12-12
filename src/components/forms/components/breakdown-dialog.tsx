import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Check, Banknote } from "lucide-react"
import { COST_CATEGORIES } from "@/constants/service-types"
import { formatCost } from "@/utils"

interface CostBreakdownFormState {
  itemDescription: string
  itemCategory: "Labor" | "Parts" | "Fluids" | "Other"
  quantity: number | string
  unitPrice: number | string
}

interface BreakdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: CostBreakdownFormState
  onFormDataChange: (data: CostBreakdownFormState) => void
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  isEditing: boolean
}

export function BreakdownDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading,
  isEditing,
}: BreakdownDialogProps) {
  const totalPrice = (Number(formData.quantity) || 0) * (Number(formData.unitPrice) || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            onFormDataChange({
              itemDescription: "",
              itemCategory: "Labor",
              quantity: 1,
              unitPrice: 0,
            })
          }}
          disabled={isLoading}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Cost Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            {isEditing ? "Edit Cost Item" : "Add Cost Item"}
          </DialogTitle>
          <DialogDescription>Add itemized costs for this service record</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-3">
            <Label htmlFor="itemDescription">Description</Label>
            <Input
              id="itemDescription"
              placeholder="e.g., Synthetic Oil, Air Filter, Labor"
              value={formData.itemDescription}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  itemDescription: e.target.value,
                })
              }
              required
              className="transition-colors focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="itemCategory">Category</Label>
            <Select
              value={formData.itemCategory}
              onValueChange={(value) =>
                onFormDataChange({
                  ...formData,
                  itemCategory: value as "Labor" | "Parts" | "Fluids" | "Other",
                })
              }
              required
            >
              <SelectTrigger id="itemCategory" className="transition-colors focus:ring-2 focus:ring-primary/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {COST_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    quantity: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                required
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="text"
                inputMode="decimal"
                min="0"
                placeholder="0.00"
                value={formData.unitPrice === 0 ? "" : formData.unitPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "")
                  onFormDataChange({
                    ...formData,
                    unitPrice: value === "" ? "" : Number(value),
                  })
                }}
                required
                className="transition-colors focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
            <Label className="text-sm">Total Price</Label>
            <div className="text-xl font-bold text-primary">{formatCost(totalPrice)}</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 w-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 w-full gap-2">
              {isEditing ? (
                <>
                  <Check className="w-4 h-4" />
                  Update
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Item
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
