import { fetchWithAuth } from "./http"
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "./types"

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    // Validate input before sending
    if (!credentials.email || !credentials.password) {
      return { error: "Email and password are required" }
    }

    const resp = await fetchWithAuth<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    // If there's an error from the HTTP layer, return it
    if (resp.error) {
      console.error("Login API error:", resp.error)
      return resp
    }

    // Check if we have valid data
    if (!resp.data) {
      return { error: "Login failed. Please try again." }
    }

    const payload: any = resp.data
    
    console.log("Login response:", JSON.stringify(payload, null, 2))
    
    // Backend returns data nested in Data property: { Data: { userId, email, fullName, token } }
    const dataObject = payload?.Data || payload?.data || payload
    
    // Extract fields from the data object
    const userId = dataObject?.userId || dataObject?.UserId || dataObject?.id || dataObject?.Id
    const token = dataObject?.token || dataObject?.Token
    const email = dataObject?.email || dataObject?.Email || credentials.email
    const fullName = dataObject?.fullName || dataObject?.FullName || ""

    // Validate required fields
    if (!token || !userId) {
      console.error("Login response missing required fields:", {
        token: token ? "present" : "MISSING",
        userId: userId ? userId : "MISSING",
        dataObject,
        payload
      })
      return { error: "Login failed. Incomplete response from server. Please try again." }
    }

    const normalized: AuthResponse = {
      token,
      userId: String(userId),
      email: email || "",
      fullName: fullName || "",
    }

    console.log("Login successful:", { userId: normalized.userId, email: normalized.email })
    return { data: normalized }
  },

  register: async (userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    // Validate input before sending
    if (!userData.email || !userData.password || !userData.fullName) {
      return { error: "All fields are required" }
    }

    if (userData.password.length < 6) {
      return { error: "Password must be at least 6 characters long" }
    }

    const resp = await fetchWithAuth<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })

    // If there's an error from the HTTP layer, return it (catches duplicate email, etc.)
    if (resp.error) {
      console.error("Registration API error:", resp.error)
      return resp
    }

    // Check if we have valid data
    if (!resp.data) {
      return { error: "Registration failed. Please try again." }
    }

    const payload: any = resp.data
    
    console.log("Registration response:", JSON.stringify(payload, null, 2))
    
    // Backend returns data nested in Data property: { Data: { userId, email, fullName, token } }
    const dataObject = payload?.Data || payload?.data || payload
    
    // Extract fields from the data object
    const userId = dataObject?.userId || dataObject?.UserId || dataObject?.id || dataObject?.Id
    const token = dataObject?.token || dataObject?.Token
    const email = dataObject?.email || dataObject?.Email || userData.email
    const fullName = dataObject?.fullName || dataObject?.FullName || userData.fullName

    // Validate required fields
    if (!token || !userId) {
      console.error("Registration response missing required fields:", {
        token: token ? "present" : "MISSING",
        userId: userId ? userId : "MISSING",
        dataObject,
        payload
      })
      return { error: "Registration failed. Incomplete response from server. Please try again." }
    }

    const normalized: AuthResponse = {
      token,
      userId: String(userId),
      email: email || "",
      fullName: fullName || "",
    }

    console.log("Registration successful:", { userId: normalized.userId, email: normalized.email })
    return { data: normalized }
  }
}
