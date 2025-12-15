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

    // Parse response (works for both success and error)
    const responseData = await response.json().catch(() => null)
    
    // Check if C# backend returned Success = false (even with 200 status)
    if (responseData && responseData.Success === false) {
      // Extract error message from C# ApiResponse structure
      const errorMessage = responseData.Message || 
                          responseData.message || 
                          responseData.error || 
                          responseData.Error ||
                          "An error occurred"
      return { error: errorMessage }
    }
    
    if (!response.ok) {
      // Handle specific status codes
      if (response.status === 401) {
        // Check if it's an email not found error vs wrong password
        const message = responseData?.Message || responseData?.message || responseData?.error || ""
        if (message.toLowerCase().includes("email") || message.toLowerCase().includes("not found") || message.toLowerCase().includes("user")) {
          return { error: "Email not found in system. Please check your email or create a new account." }
        }
        return { error: responseData?.Message || responseData?.message || "Invalid password. Please try again." }
      }
      if (response.status === 403) {
        return { error: responseData?.Message || responseData?.message || "Access forbidden. Please check your permissions." }
      }
      if (response.status === 400) {
        return { error: responseData?.Message || responseData?.message || responseData?.error || "Invalid request. Please check your input." }
      }
      if (response.status === 409) {
        // Check if it's a duplicate license plate or email
        const message = responseData?.Message || responseData?.message || responseData?.error || ""
        if (message.toLowerCase().includes("license") || message.toLowerCase().includes("plate") || message.toLowerCase().includes("vehicle number")) {
          return { error: "This vehicle number is already added." }
        }
        return { error: "This email is already registered. Please use a different email or try logging in." }
      }
      if (response.status === 404) {
        return { error: responseData?.Message || responseData?.message || "User not found. Please check your email or register a new account." }
      }
      
      // Generic error with status code
      return { error: responseData?.Message || responseData?.message || responseData?.error || `Request failed with status ${response.status}` }
    }

    return { data: responseData }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Network error. Please check your connection." }
  }
}
