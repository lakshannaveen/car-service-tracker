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
      // Parse error response for detailed message
      const errorData = await response.json().catch(() => null)
      
      // Handle specific status codes
      if (response.status === 401) {
        return { error: errorData?.message || "Invalid credentials. Please check your email and password." }
      }
      if (response.status === 403) {
        return { error: errorData?.message || "Access forbidden. Please check your permissions." }
      }
      if (response.status === 400) {
        return { error: errorData?.message || errorData?.error || "Invalid request. Please check your input." }
      }
      if (response.status === 409) {
        return { error: errorData?.message || "This email is already registered. Please use a different email or try logging in." }
      }
      if (response.status === 404) {
        return { error: errorData?.message || "User not found. Please check your email or register a new account." }
      }
      
      // Generic error with status code
      return { error: errorData?.message || errorData?.error || `Request failed with status ${response.status}` }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Network error. Please check your connection." }
  }
}
