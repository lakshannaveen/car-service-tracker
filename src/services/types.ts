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
