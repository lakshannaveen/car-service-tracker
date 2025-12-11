// API utility functions for connecting to C# backend
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:60748/api"
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://cartrackerbackend.dockyardsoftware.com/api"

// Return a URL that can be used to serve/preview an attachment via the backend
export function getAttachmentServeUrl(attachmentId: string) {
  // If API_BASE_URL ends with /api, strip it so we can call controller routes at the app root
  const host = API_BASE_URL.replace(/\/api\/?$/i, "")
  return `${host}/Attachments/ServeAttachment/${attachmentId}`
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

export interface AuthResponse {
  token: string
  userId: string
  email: string
  fullName: string
}

export interface Vehicle {
  vehicleId?: string
  userId?: string
  make: string
  model: string
  year: number
  licensePlate: string
}

export interface ServiceRecord {
  items: any
  recordId?: string
  vehicleId: string
  serviceDate: string 
  serviceType: string
  providerName: string
  cost: number
  description: string
  mileage?: number | null
  costBreakdowns?: CostBreakdown[]
  createdAt?: string
}

export interface CostBreakdown {
  breakdownId?: string
  recordId?: string
  itemDescription: string
  itemCategory: "Labor" | "Parts" | "Fluids" | "Other"
  quantity: number
  unitPrice: number
  totalPrice?: number
  createdAt?: string
}

export interface CreateCostBreakdownRequest {
  itemDescription: string
  itemCategory: string
  quantity: number
  unitPrice: number
}

export interface Attachment {
  attachmentId: string
  recordId: string
  fileName: string
  filePath: string
  fileSize: number
  uploadedAt: string
}

// Helper function to get auth token
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Helper function to make authenticated requests
async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken()
  // Use a plain record so we can safely assign header properties in TypeScript
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Request failed" }))
      return { error: errorData.message || `Error: ${response.status}` }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Network error" }
  }
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const resp = await fetchWithAuth<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (resp.error) return resp

    // Unwrap common envelope shapes: { Data: {...} } or { data: {...} }
    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload

    // Normalize shape and types (ensure userId is a string)
    const normalized: AuthResponse | null = unwrapped
      ? {
          token: unwrapped.token ?? unwrapped.Token ?? unwrapped.data?.token ?? unwrapped.Data?.token,
          userId: String(unwrapped.userId ?? unwrapped.UserId ?? unwrapped.data?.userId ?? unwrapped.Data?.userId ?? ""),
          email: unwrapped.email ?? unwrapped.Email ?? unwrapped.data?.email ?? unwrapped.Data?.email,
          fullName: unwrapped.fullName ?? unwrapped.FullName ?? unwrapped.data?.fullName ?? unwrapped.Data?.fullName,
        }
      : null

    console.debug("authApi.login: raw payload:", payload, "normalized:", normalized)

    return { data: normalized as any }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const resp = await fetchWithAuth<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload

    const normalized: AuthResponse | null = unwrapped
      ? {
          token: unwrapped.token ?? unwrapped.Token ?? unwrapped.data?.token ?? unwrapped.Data?.token,
          userId: String(unwrapped.userId ?? unwrapped.UserId ?? unwrapped.data?.userId ?? unwrapped.Data?.userId ?? ""),
          email: unwrapped.email ?? unwrapped.Email ?? unwrapped.data?.email ?? unwrapped.Data?.email,
          fullName: unwrapped.fullName ?? unwrapped.FullName ?? unwrapped.data?.fullName ?? unwrapped.Data?.fullName,
        }
      : null

    console.debug("authApi.register: raw payload:", payload, "normalized:", normalized)

    return { data: normalized as any }
  },
}

// Vehicles API
export const vehiclesApi = {
  getAll: async (): Promise<ApiResponse<Vehicle[]>> => {
    const resp = await fetchWithAuth<any>("/vehicles/getAllVehicles")
    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload

    const list: any[] = Array.isArray(unwrapped) ? unwrapped : []

    const normalized = list.map((v: any) => ({
      vehicleId: String(v.VehicleId ?? v.vehicleId ?? v.Id ?? ""),
      userId: String(v.UserId ?? v.userId ?? ""),
      make: v.Make ?? v.make ?? "",
      model: v.Model ?? v.model ?? "",
      year: Number(v.Year ?? v.year ?? 0),
      licensePlate: v.LicensePlate ?? v.licensePlate ?? "",
    }))

    return { data: normalized }
  },

  create: async (vehicle: Vehicle): Promise<ApiResponse<Vehicle>> => {
    return fetchWithAuth<Vehicle>("/vehicles/createVehicle", {
      method: "POST",
      body: JSON.stringify(vehicle),
    })
  },

  update: async (id: string, vehicle: Vehicle): Promise<ApiResponse<Vehicle>> => {
    return fetchWithAuth<Vehicle>(`/vehicles/updateVehicle/${id}`, {
      method: "PUT",
      body: JSON.stringify(vehicle),
    })
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/vehicles/deleteVehicle/${id}`, {
      method: "DELETE",
    })
  },
}

// Service Records API
export const serviceRecordsApi = {
  getAll: async (vehicleId?: string): Promise<ApiResponse<ServiceRecord[]>> => {
    const query = vehicleId ? `?vehicleId=${vehicleId}` : ""
    const resp = await fetchWithAuth<any>(`/servicerecords/getServiceRecords${query}`)

    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload

    const list: any[] = Array.isArray(unwrapped) ? unwrapped : []

    // Helper to parse .NET /Date(123...)/ and ISO date strings into ISO format
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

    // Helper to parse .NET /Date(123...)/ and ISO date strings into ISO format
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

    // Normalize to front-end shape with camelCase keys
const normalized: ServiceRecord | null = unwrapped
  ? {
      recordId: String(unwrapped.RecordId ?? unwrapped.recordId ?? unwrapped.Id ?? ""),
      vehicleId: String(unwrapped.VehicleId ?? unwrapped.vehicleId ?? unwrapped.VehicleId ?? ""),
      serviceDate:
        parseDotNetDate(unwrapped.ServiceDate ?? unwrapped.serviceDate ?? "") || "",
      serviceType: unwrapped.ServiceType ?? unwrapped.serviceType ?? "",
      providerName: unwrapped.ProviderName ?? unwrapped.providerName ?? "",
      cost: Number(unwrapped.Cost ?? unwrapped.cost ?? 0),
      description: unwrapped.Description ?? unwrapped.description ?? "",
      mileage: unwrapped.Mileage ?? unwrapped.mileage ?? undefined,
      costBreakdowns: normalizeCostBreakdowns(
        unwrapped.CostBreakdowns ?? unwrapped.costBreakdowns ?? []
      ),
      createdAt:
        parseDotNetDate(unwrapped.CreatedAt ?? unwrapped.createdAt ?? null) ||
        undefined,

      // ✅ REQUIRED FIELD — FIXES YOUR ERROR
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

// Cost Breakdowns API
export const costBreakdownsApi = {
  getByRecordId: async (recordId: string): Promise<ApiResponse<CostBreakdown[]>> => {
    const resp = await fetchWithAuth<any>(`/servicerecords/${recordId}/costbreakdowns`)
    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload ?? []
    const arr: any[] = Array.isArray(unwrapped) ? unwrapped : []

    return { data: normalizeCostBreakdowns(arr) as any }
  },

  create: async (recordId: string, breakdown: CreateCostBreakdownRequest): Promise<ApiResponse<CostBreakdown>> => {
    return fetchWithAuth<CostBreakdown>(`/servicerecords/${recordId}/costbreakdowns`, {
      method: "POST",
      body: JSON.stringify(breakdown),
    })
  },

  createBatch: async (recordId: string, breakdowns: CreateCostBreakdownRequest[]): Promise<ApiResponse<CostBreakdown[]>> => {
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

// Helper function to normalize cost breakdowns from API response
function normalizeCostBreakdowns(breakdowns: any[]): CostBreakdown[] {
  if (!Array.isArray(breakdowns)) return []
  return breakdowns.map((b: any) => ({
    breakdownId: String(b.BreakdownId ?? b.breakdownId ?? b.Id ?? ""),
    recordId: String(b.RecordId ?? b.recordId ?? ""),
    itemDescription: b.ItemDescription ?? b.itemDescription ?? "",
    itemCategory: b.ItemCategory ?? b.itemCategory ?? "Other",
    quantity: Number(b.Quantity ?? b.quantity ?? 0),
    unitPrice: Number(b.UnitPrice ?? b.unitPrice ?? 0),
    totalPrice: Number(b.TotalPrice ?? b.totalPrice ?? (Number(b.Quantity ?? b.quantity ?? 0) * Number(b.UnitPrice ?? b.unitPrice ?? 0))),
    createdAt: b.CreatedAt ?? b.createdAt ?? undefined,
  }))
}

// Attachments API
export const attachmentsApi = {
  getByRecordId: async (recordId: string): Promise<ApiResponse<Attachment[]>> => {
    const resp = await fetchWithAuth<Attachment[]>(`/attachments/getAttachments?recordId=${recordId}`)

    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload ?? []

    const arr: any[] = Array.isArray(unwrapped) ? unwrapped : []

    // Normalize PascalCase -> camelCase
    const normalized = arr.map((a) => ({
      attachmentId: String(a.AttachmentId ?? a.attachmentId ?? ""),
      recordId: String(a.RecordId ?? a.recordId ?? ""),
      fileName: a.FileName ?? a.fileName ?? "",
      filePath: a.FilePath ?? a.filePath ?? "",
      fileSize: Number(a.FileSize ?? a.fileSize ?? 0),
      uploadedAt: a.UploadedAt ?? a.uploadedAt ?? "",
    }))

    return { data: normalized as any }
  },

  upload: async (recordId: string, files: File[]): Promise<ApiResponse<Attachment[]>> => {
    const token = getAuthToken()
    const formData = new FormData()

    files.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch(`${API_BASE_URL}/attachments/uploadAttachments?recordId=${recordId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Upload failed" }))
        return { error: errorData.message || `Error: ${response.status}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  },

  delete: async (attachmentId: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/attachments/deleteAttachment/${attachmentId}`, {
      method: "DELETE",
    })
  },

  // Download attachment as a blob. Backend should expose a download endpoint like
  // /attachments/downloadAttachment/{attachmentId} which returns the file bytes.
  download: async (attachmentId: string): Promise<ApiResponse<Blob>> => {
    const token = getAuthToken()
    try {
      const url = getAttachmentServeUrl(attachmentId)
      const response = await fetch(url, {
        method: "GET",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      })

      if (!response.ok) {
        const err = await response.text().catch(() => "Download failed")
        return { error: err || `Error: ${response.status}` }
      }

      const blob = await response.blob()
      return { data: blob }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  },
}

export {};
