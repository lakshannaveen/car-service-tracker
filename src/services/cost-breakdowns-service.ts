import { fetchWithAuth } from "./http"
import { normalizeCostBreakdowns } from "./normalizers"
import type { ApiResponse, CostBreakdown, CreateCostBreakdownRequest } from "./types"

export const costBreakdownsApi = {
  getByRecordId: async (recordId: string): Promise<ApiResponse<CostBreakdown[]>> => {
    const resp = await fetchWithAuth<any>(`/servicerecords/${recordId}/costbreakdowns`)

    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload ?? []

    return { data: normalizeCostBreakdowns(unwrapped) }
  },

  create: async (recordId: string, breakdown: CreateCostBreakdownRequest): Promise<ApiResponse<CostBreakdown>> => {
    return fetchWithAuth<CostBreakdown>(`/servicerecords/${recordId}/costbreakdowns`, {
      method: "POST",
      body: JSON.stringify(breakdown),
    })
  },

  createBatch: async (
    recordId: string,
    breakdowns: CreateCostBreakdownRequest[],
  ): Promise<ApiResponse<CostBreakdown[]>> => {
    return fetchWithAuth<CostBreakdown[]>(`/servicerecords/${recordId}/costbreakdowns/batch`, {
      method: "POST",
      body: JSON.stringify(breakdowns),
    })
  },

  update: async (breakdownId: string, breakdown: Partial<CostBreakdown>): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/costbreakdowns/${breakdownId}`, {
      method: "PUT",
      body: JSON.stringify(breakdown),
    })
  },

  delete: async (breakdownId: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/costbreakdowns/${breakdownId}`, {
      method: "DELETE",
    })
  },
}
