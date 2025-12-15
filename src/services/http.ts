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

    // Parse the response
    let responseData = null
    try {
      responseData = await response.json()
    } catch {
      responseData = null
    }

    // Check if response was successful
    if (!response.ok) {
      // Handle error responses - check for both uppercase and lowercase
      const errorMessage = 
        responseData?.message || 
        responseData?.Message || 
        responseData?.error || 
        responseData?.Error || 
        ""
      
      console.error(`API Error ${response.status}:`, { responseData, errorMessage })
      
      // Return the error message from backend
      return { error: errorMessage || `Request failed with status ${response.status}` }
    }

    // Success response - check if the backend returned success: false or Success: false
    // This handles the case where HTTP is 200 but the response indicates failure
    if (responseData?.success === false || responseData?.Success === false) {
      // Response indicates failure
      const errorMessage = responseData?.message || responseData?.Message || "Operation failed"
      console.error("API returned success=false:", { errorMessage, responseData })
      return { error: errorMessage }
    }

    // Return the data from the response - handle both Data and data
    return { data: responseData?.data ?? responseData?.Data ?? responseData }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Network error. Please check your connection." }
  }
}
