import type { CostBreakdown } from "./types"

export function normalizeCostBreakdowns(breakdowns: any[]): CostBreakdown[] {
  if (!Array.isArray(breakdowns)) return []
  return breakdowns.map((b: any) => ({
    breakdownId: String(b.BreakdownId ?? b.breakdownId ?? b.Id ?? ""),
    recordId: String(b.RecordId ?? b.recordId ?? ""),
    itemDescription: b.ItemDescription ?? b.itemDescription ?? "",
    itemCategory: b.ItemCategory ?? b.itemCategory ?? "Other",
    quantity: Number(b.Quantity ?? b.quantity ?? 0),
    unitPrice: Number(b.UnitPrice ?? b.unitPrice ?? 0),
    totalPrice:
      Number(b.TotalPrice ?? b.totalPrice ?? Number(b.Quantity ?? b.quantity ?? 0) * Number(b.UnitPrice ?? b.unitPrice ?? 0)),
    createdAt: b.CreatedAt ?? b.createdAt ?? undefined,
  }))
}
