import { fetchWithAuth } from "./http"
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "./types"

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    // Validate input before sending
    if (!credentials.email || !credentials.password) {
      return { error: "Email and password are required" }
    }

    const resp = await fetchWithAuth<AuthResponse>("/auth/login", {
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
      return { error: "Invalid credentials. Please check your email and password." }
    }

    const payload: any = resp.data
    
    // Log the raw response to debug structure
    console.log("Login raw response:", JSON.stringify(payload, null, 2))
    
    // Try multiple unwrapping strategies
    const unwrapped = payload?.Data ?? payload?.data ?? payload
    
    // Extract token with multiple fallback strategies
    const token = unwrapped?.token ?? 
                  unwrapped?.Token ?? 
                  unwrapped?.data?.token ?? 
                  unwrapped?.Data?.token ??
                  payload?.token ??
                  payload?.Token
    
    // Extract userId with multiple fallback strategies (handle both string and number)
    const userIdRaw = unwrapped?.userId ?? 
                      unwrapped?.UserId ?? 
                      unwrapped?.id ??
                      unwrapped?.Id ??
                      unwrapped?.data?.userId ?? 
                      unwrapped?.Data?.userId ??
                      payload?.userId ??
                      payload?.UserId ??
                      payload?.id ??
                      payload?.Id
    
    const userId = userIdRaw ? String(userIdRaw) : ""
    
    // Extract email
    const email = unwrapped?.email ?? 
                  unwrapped?.Email ?? 
                  unwrapped?.data?.email ?? 
                  unwrapped?.Data?.email ??
                  payload?.email ??
                  payload?.Email ??
                  credentials.email  // fallback to input
    
    // Extract fullName
    const fullName = unwrapped?.fullName ?? 
                     unwrapped?.FullName ?? 
                     unwrapped?.data?.fullName ?? 
                     unwrapped?.Data?.fullName ??
                     payload?.fullName ??
                     payload?.FullName ??
                     ""

    const normalized: AuthResponse = {
      token: token || "",
      userId: userId,
      email: email || "",
      fullName: fullName || "",
    }

    // Log what we extracted
    console.log("Login normalized:", { 
      hasToken: !!normalized.token, 
      hasUserId: !!normalized.userId,
      userId: normalized.userId,
      email: normalized.email 
    })

    // Validate that required fields are present
    if (!normalized.token || !normalized.userId) {
      console.error("Login response missing required fields:", {
        token: normalized.token ? "present" : "MISSING",
        userId: normalized.userId ? normalized.userId : "MISSING",
        rawPayload: payload,
        unwrapped: unwrapped
      })
      return { error: "Login failed. Invalid response from server. Please try again." }
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

    const resp = await fetchWithAuth<AuthResponse>("/auth/register", {
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
    
    // Log the raw response to debug structure
    console.log("Registration raw response:", JSON.stringify(payload, null, 2))
    
    // Try multiple unwrapping strategies
    const unwrapped = payload?.Data ?? payload?.data ?? payload
    
    // Extract token with multiple fallback strategies
    const token = unwrapped?.token ?? 
                  unwrapped?.Token ?? 
                  unwrapped?.data?.token ?? 
                  unwrapped?.Data?.token ??
                  payload?.token ??
                  payload?.Token
    
    // Extract userId with multiple fallback strategies (handle both string and number)
    const userIdRaw = unwrapped?.userId ?? 
                      unwrapped?.UserId ?? 
                      unwrapped?.id ??
                      unwrapped?.Id ??
                      unwrapped?.data?.userId ?? 
                      unwrapped?.Data?.userId ??
                      payload?.userId ??
                      payload?.UserId ??
                      payload?.id ??
                      payload?.Id
    
    const userId = userIdRaw ? String(userIdRaw) : ""
    
    // Extract email
    const email = unwrapped?.email ?? 
                  unwrapped?.Email ?? 
                  unwrapped?.data?.email ?? 
                  unwrapped?.Data?.email ??
                  payload?.email ??
                  payload?.Email ??
                  userData.email  // fallback to input
    
    // Extract fullName
    const fullName = unwrapped?.fullName ?? 
                     unwrapped?.FullName ?? 
                     unwrapped?.data?.fullName ?? 
                     unwrapped?.Data?.fullName ??
                     payload?.fullName ??
                     payload?.FullName ??
                     userData.fullName  // fallback to input

    const normalized: AuthResponse = {
      token: token || "",
      userId: userId,
      email: email || "",
      fullName: fullName || "",
    }

    // Log what we extracted
    console.log("Registration normalized:", { 
      hasToken: !!normalized.token, 
      hasUserId: !!normalized.userId,
      userId: normalized.userId,
      email: normalized.email 
    })

    // Validate that required fields are present
    if (!normalized.token || !normalized.userId) {
      console.error("Registration response missing required fields:", {
        token: normalized.token ? "present" : "MISSING",
        userId: normalized.userId ? normalized.userId : "MISSING",
        rawPayload: payload,
        unwrapped: unwrapped
      })
      return { error: "Registration failed. Invalid response from server. Please try again." }
    }

    console.log("Registration successful:", { userId: normalized.userId, email: normalized.email })
    return { data: normalized }
  }
}
