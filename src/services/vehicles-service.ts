import { fetchWithAuth } from "./http"
import type { ApiResponse, Vehicle } from "./types"

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
