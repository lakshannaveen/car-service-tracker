import { fetchWithAuth } from "./http"
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from "./types"

export const authApi = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const resp = await fetchWithAuth<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
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

    return { data: normalized as any }
  },
}
