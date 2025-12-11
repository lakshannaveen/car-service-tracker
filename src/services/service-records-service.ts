import { fetchWithAuth } from "./http"
import { normalizeCostBreakdowns } from "./normalizers"
import type { ApiResponse, ServiceRecord } from "./types"

const parseDotNetDate = (val: any): string | undefined => {
  if (val === null || val === undefined || val === "") return undefined
  if (typeof val === "number") return new Date(val).toISOString()
  if (typeof val === "string") {
    const dotNetMatch = val.match(/\/Date\((\d+)\)\//)
    if (dotNetMatch && dotNetMatch[1]) return new Date(Number(dotNetMatch[1])).toISOString()
    const parsed = Date.parse(val)
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString()
    return undefined
  }
  return String(val)
}

export const serviceRecordsApi = {
  getAll: async (vehicleId?: string): Promise<ApiResponse<ServiceRecord[]>> => {
    const query = vehicleId ? `?vehicleId=${vehicleId}` : ""
    const resp = await fetchWithAuth<any>(`/servicerecords/getServiceRecords${query}`)

    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload
    const list: any[] = Array.isArray(unwrapped) ? unwrapped : []

    const normalized = list.map((r: any) => ({
      recordId: String(r.RecordId ?? r.recordId ?? r.Id ?? ""),
      vehicleId: String(r.VehicleId ?? r.vehicleId ?? ""),
      serviceDate: parseDotNetDate(r.ServiceDate ?? r.serviceDate ?? "") || "",
      serviceType: r.ServiceType ?? r.serviceType ?? "",
      providerName: r.ProviderName ?? r.providerName ?? "",
      cost: Number(r.Cost ?? r.cost ?? 0),
      description: r.Description ?? r.description ?? "",
      mileage: r.Mileage ?? r.mileage ?? undefined,
      costBreakdowns: normalizeCostBreakdowns(r.CostBreakdowns ?? r.costBreakdowns ?? []),
      createdAt: parseDotNetDate(r.CreatedAt ?? r.createdAt ?? null) || undefined,
      items: r.Items ?? r.items ?? [],
    }))

    return { data: normalized }
  },

  getById: async (id: string): Promise<ApiResponse<ServiceRecord>> => {
    return fetchWithAuth<ServiceRecord>(`/servicerecords/getServiceRecordById/${id}`)
  },

  create: async (record: any): Promise<ApiResponse<ServiceRecord>> => {
    const resp = await fetchWithAuth<any>("/servicerecords/createServiceRecord", {
      method: "POST",
      body: JSON.stringify(record),
    })

    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload

    const normalized: ServiceRecord | null = unwrapped
      ? {
          recordId: String(unwrapped.RecordId ?? unwrapped.recordId ?? unwrapped.Id ?? ""),
          vehicleId: String(unwrapped.VehicleId ?? unwrapped.vehicleId ?? unwrapped.VehicleId ?? ""),
          serviceDate: parseDotNetDate(unwrapped.ServiceDate ?? unwrapped.serviceDate ?? "") || "",
          serviceType: unwrapped.ServiceType ?? unwrapped.serviceType ?? "",
          providerName: unwrapped.ProviderName ?? unwrapped.providerName ?? "",
          cost: Number(unwrapped.Cost ?? unwrapped.cost ?? 0),
          description: unwrapped.Description ?? unwrapped.description ?? "",
          mileage: unwrapped.Mileage ?? unwrapped.mileage ?? undefined,
          costBreakdowns: normalizeCostBreakdowns(unwrapped.CostBreakdowns ?? unwrapped.costBreakdowns ?? []),
          createdAt: parseDotNetDate(unwrapped.CreatedAt ?? unwrapped.createdAt ?? null) || undefined,
          items: unwrapped.Items ?? unwrapped.items ?? [],
        }
      : null

    return { data: normalized as any }
  },

  update: async (id: string, record: any): Promise<ApiResponse<ServiceRecord>> => {
    return fetchWithAuth<ServiceRecord>(`/servicerecords/updateServiceRecord/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
    })
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/servicerecords/deleteServiceRecord/${id}`, {
      method: "DELETE",
    })
  },
}
