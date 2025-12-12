import type { CostBreakdown } from "@/services"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X } from "lucide-react"
import { useEffect } from "react"

interface CostBreakdownModalProps {
  breakdowns: CostBreakdown[]
  totalCost?: number
  isOpen: boolean
  onClose: () => void
}

const categoryColors: Record<string, string> = {
  Labor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Parts: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Fluids: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
}

export function CostBreakdownModal({ breakdowns, totalCost, isOpen, onClose }: CostBreakdownModalProps) {
  // Lock body scroll only while open
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = isOpen ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = previous || "auto"
    }
  }, [isOpen])

  if (!isOpen) return null

  const breakdownTotal = breakdowns.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  const categoryTotals = breakdowns.reduce((acc, b) => {
    const category = b.itemCategory || "Other"
    acc[category] = (acc[category] || 0) + (b.totalPrice || 0)
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        // Use a theme-aware background here so the rounded corners don't show white artifacts in dark mode (fixes Edge/Chromium rendering)
        className="relative w-[90%] max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-lg bg-white dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-600 hover:text-purple-800"
          aria-label="Close cost breakdown"
        >
          <X className="w-6 h-6" />
        </button>

        <Card className="h-full overflow-y-auto scrollbar-none">
          <CardHeader>
            <CardTitle className="text-base">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdowns.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No itemized cost breakdown available
              </p>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="py-2">Item</TableHead>
                        <TableHead className="py-2">Category</TableHead>
                        <TableHead className="py-2 text-right">Qty</TableHead>
                        <TableHead className="py-2 text-right">Unit Price</TableHead>
                        <TableHead className="py-2 text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {breakdowns.map((b, idx) => (
                        <TableRow key={b.breakdownId || idx}>
                          <TableCell className="py-2 font-medium">{b.itemDescription}</TableCell>
                          <TableCell className="py-2">
                            <Badge variant="outline" className={categoryColors[b.itemCategory || "Other"] || ""}>
                              {b.itemCategory || "Other"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-right">{b.quantity}</TableCell>
                          <TableCell className="py-2 text-right">
                            {/* Guard in case unitPrice is undefined */}
                            {typeof b.unitPrice === "number" ? b.unitPrice.toFixed(2) : "-"}
                          </TableCell>
                          <TableCell className="py-2 text-right font-semibold">
                            LKR {(b.totalPrice || 0).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Summary by Category</p>
                  <div className="space-y-1">
                    {Object.entries(categoryTotals).map(([category, total]) => (
                      <div key={category} className="flex items-center justify-between py-1">
                        <Badge variant="outline" className={categoryColors[category] || ""}>
                          {category}
                        </Badge>
                        <span className="font-medium">LKR {total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                  <span className="font-semibold">Total Cost</span>
                  <span className="text-lg font-bold">LKR {breakdownTotal.toFixed(2)}</span>
                </div>

                {totalCost !== undefined && Math.abs(breakdownTotal - totalCost) > 0.01 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Note: Breakdown total (LKR {breakdownTotal.toFixed(2)}) differs from recorded total (LKR {totalCost.toFixed(2)})
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}