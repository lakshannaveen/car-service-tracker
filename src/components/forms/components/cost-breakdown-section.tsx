import type React from "react"
import type { CostBreakdown } from "@/services"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Banknote, Edit, Trash2 } from "lucide-react"
import { CostBreakdownCard } from "@/components/cards"
import { BreakdownDialog } from "./breakdown-dialog"
import { formatCost } from "@/utils"

interface CostBreakdownFormState {
  itemDescription: string
  itemCategory: "Labor" | "Parts" | "Fluids" | "Other"
  quantity: number | string
  unitPrice: number | string
}

interface CostBreakdownSectionProps {
  costBreakdowns: CostBreakdown[]
  breakdownDialogOpen: boolean
  setBreakdownDialogOpen: (open: boolean) => void
  breakdownFormData: CostBreakdownFormState
  setBreakdownFormData: (data: CostBreakdownFormState) => void
  editingBreakdownIndex: number | null
  setEditingBreakdownIndex: (index: number | null) => void
  onAddBreakdown: (e: React.FormEvent) => void
  onEditBreakdown: (index: number) => void
  onDeleteBreakdown: (index: number) => void
  isLoading: boolean
}

const categoryStyles: Record<string, string> = {
  Labor: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-300",
  Parts: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300",
  Fluids: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-900/20 dark:text-purple-300",
  Other: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-900 dark:bg-gray-900/20 dark:text-gray-300",
}

const TotalBreakdownCost = ({ breakdowns }: { breakdowns: CostBreakdown[] }) => {
  const total = breakdowns.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  return (
    <div className="flex items-center justify-between bg-linear-to-r from-primary/5 to-primary/10 p-4 rounded-lg border-2 border-primary/10">
      <span className="font-semibold text-lg">Total:</span>
      <span className="text-xl font-bold text-primary">{formatCost(total)}</span>
    </div>
  )
}

const EmptyState = () => (
  <div className="text-center py-8">
    <div className="flex flex-col items-center space-y-3 text-muted-foreground">
      <Banknote className="w-12 h-12 opacity-40" />
      <p className="font-medium">No cost items added</p>
      <p className="text-sm">Click "Add Item" to break down the service costs</p>
    </div>
  </div>
)

export function CostBreakdownSection({
  costBreakdowns,
  breakdownDialogOpen,
  setBreakdownDialogOpen,
  breakdownFormData,
  setBreakdownFormData,
  editingBreakdownIndex,
  onAddBreakdown,
  onEditBreakdown,
  onDeleteBreakdown,
  isLoading,
}: CostBreakdownSectionProps) {
  return (
    <Card className="border-2 border-muted/50 bg-linear-to-br from-background to-muted/5">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Banknote className="w-5 h-5 text-primary" />
              Cost Breakdown
            </CardTitle>
            <CardDescription>Itemize your service costs for better tracking</CardDescription>
          </div>
          <BreakdownDialog
            open={breakdownDialogOpen}
            onOpenChange={setBreakdownDialogOpen}
            formData={breakdownFormData}
            onFormDataChange={setBreakdownFormData}
            onSubmit={onAddBreakdown}
            isLoading={isLoading}
            isEditing={editingBreakdownIndex !== null}
          />
        </div>
      </CardHeader>

      {costBreakdowns.length > 0 ? (
        <CardContent className="space-y-4">
          <div className="hidden md:block border-2 border-muted/30 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="py-3 font-semibold">Description</TableHead>
                  <TableHead className="py-3 font-semibold">Category</TableHead>
                  <TableHead className="py-3 font-semibold text-right">Qty</TableHead>
                  <TableHead className="py-3 font-semibold text-right">Unit Price</TableHead>
                  <TableHead className="py-3 font-semibold text-right">Total</TableHead>
                  <TableHead className="py-3 text-center w-14"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costBreakdowns.map((breakdown, index) => (
                  <TableRow key={index} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="py-3 font-medium">{breakdown.itemDescription}</TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline" className={categoryStyles[breakdown.itemCategory] || ""}>
                        {breakdown.itemCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">{breakdown.quantity}</TableCell>
                    <TableCell className="py-3 text-right">{formatCost(breakdown.unitPrice)}</TableCell>
                    <TableCell className="py-3 text-right font-semibold">
                      {formatCost(breakdown.totalPrice || 0)}
                    </TableCell>
                    <TableCell className="py-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEditBreakdown(index)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onDeleteBreakdown(index)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {costBreakdowns.map((breakdown, index) => (
              <CostBreakdownCard
                key={index}
                breakdown={breakdown}
                index={index}
                onEdit={onEditBreakdown}
                onDelete={onDeleteBreakdown}
                formatCost={formatCost}
              />
            ))}
          </div>

          <TotalBreakdownCost breakdowns={costBreakdowns} />
        </CardContent>
      ) : (
        <CardContent>
          <EmptyState />
        </CardContent>
      )}
    </Card>
  )
}
