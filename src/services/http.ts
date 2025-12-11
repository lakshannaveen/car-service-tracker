import { API_BASE_URL } from "./config"
import type { ApiResponse } from "./types"

// Helper function to get auth token
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("authToken")
}

// Helper function to make authenticated requests
export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getAuthToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }

  const isFormData = options.body instanceof FormData
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json"
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
