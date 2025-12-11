import { API_BASE_URL } from "./config"
import { fetchWithAuth, getAuthToken } from "./http"
import type { ApiResponse, Attachment } from "./types"

const normalizeAttachment = (a: any): Attachment => ({
  attachmentId: String(a.AttachmentId ?? a.attachmentId ?? a.Id ?? ""),
  recordId: String(a.RecordId ?? a.recordId ?? a.ServiceRecordId ?? ""),
  fileName: a.FileName ?? a.fileName ?? "",
  filePath: a.FilePath ?? a.filePath ?? a.Url ?? "",
  fileSize: Number(a.FileSize ?? a.fileSize ?? 0),
  uploadedAt: a.UploadedAt ?? a.uploadedAt ?? a.CreatedAt ?? a.createdAt ?? "",
})

export function getAttachmentServeUrl(attachmentId: string) {
  const host = API_BASE_URL.replace(/\/api\/?$/i, "")
  return `${host}/Attachments/ServeAttachment/${attachmentId}`
}

export const attachmentsApi = {
  getByRecordId: async (recordId: string): Promise<ApiResponse<Attachment[]>> => {
    const resp = await fetchWithAuth<any>(`/attachments/getAttachments?recordId=${recordId}`)
    if (resp.error) return resp

    const payload: any = resp.data
    const unwrapped = payload?.Data ?? payload?.data ?? payload ?? []
    const list: any[] = Array.isArray(unwrapped) ? unwrapped : []

    return { data: list.map(normalizeAttachment) }
  },

  upload: async (recordId: string, files: File[]): Promise<ApiResponse<Attachment[]>> => {
    const token = getAuthToken()
    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    try {
      const response = await fetch(`${API_BASE_URL}/attachments/uploadAttachments?recordId=${recordId}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Upload failed" }))
        return { error: errorData.message || `Error: ${response.status}` }
      }

      const data = await response.json().catch(() => [])
      const unwrapped = data?.Data ?? data?.data ?? data ?? []
      const list: any[] = Array.isArray(unwrapped) ? unwrapped : []
      return { data: list.map(normalizeAttachment) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  },

  delete: async (attachmentId: string): Promise<ApiResponse<void>> => {
    return fetchWithAuth<void>(`/attachments/deleteAttachment/${attachmentId}`, {
      method: "DELETE",
    })
  },

  download: async (attachmentId: string): Promise<ApiResponse<Blob>> => {
    const token = getAuthToken()
    try {
      const url = getAttachmentServeUrl(attachmentId)
      const response = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
