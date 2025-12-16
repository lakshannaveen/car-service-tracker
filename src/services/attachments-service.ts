import { API_BASE_URL } from "./config"
import { getAuthToken } from "./http"
import type { ApiResponse, Attachment } from "./types"

const normalizeAttachment = (a: any): Attachment => ({
  attachmentId: String(a.AttachmentId ?? a.attachmentId ?? a.Id ?? ""),
  recordId: String(a.RecordId ?? a.recordId ?? a.ServiceRecordId ?? ""),
  fileName: a.FileName ?? a.fileName ?? "",
  filePath: a.FilePath ?? a.filePath ?? a.Url ?? "",
  fileSize: Number(a.FileSize ?? a.fileSize ?? 0),
  uploadedAt: a.UploadedAt ?? a.uploadedAt ?? a.CreatedAt ?? a.createdAt ?? "",
})

const getHost = () => API_BASE_URL.replace(/\/api\/?$/i, "")

const buildAuthHeaders = () => {
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`
  return { headers, token }
}

export function getAttachmentServeUrl(attachmentId: string) {
  const host = getHost()
  // Backend expects query param id and streams inline
  return `${host}/Attachments/ServeAttachment?id=${encodeURIComponent(attachmentId)}`
}

export const attachmentsApi = {
  getByRecordId: async (recordId: string): Promise<ApiResponse<Attachment[]>> => {
    const { headers, token } = buildAuthHeaders()
    if (!token) return { error: "Please sign in to view attachments." }

    try {
      const response = await fetch(`${getHost()}/Attachments/GetAttachments?recordId=${encodeURIComponent(recordId)}`, {
        method: "GET",
        headers,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || (data && data.Success === false)) {
        const message = data?.Message || data?.message || data?.error || `Error: ${response.status}`
        return { error: message }
      }

      const unwrapped = data?.Data ?? data?.data ?? data ?? []
      const list: any[] = Array.isArray(unwrapped) ? unwrapped : []
      return { data: list.map(normalizeAttachment) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  },

  upload: async (recordId: string, files: File[]): Promise<ApiResponse<Attachment[]>> => {
    const { headers, token } = buildAuthHeaders()
    if (!token) return { error: "Please sign in to upload attachments." }

    const formData = new FormData()
    files.forEach((file) => formData.append("files", file))

    try {
      const response = await fetch(`${getHost()}/Attachments/UploadAttachments?recordId=${encodeURIComponent(recordId)}`, {
        method: "POST",
        headers,
        body: formData,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || (data && data.Success === false)) {
        const message = data?.Message || data?.message || data?.error || `Error: ${response.status}`
        return { error: message }
      }

      const unwrapped = data?.Data ?? data?.data ?? data ?? []
      const list: any[] = Array.isArray(unwrapped) ? unwrapped : []
      return { data: list.map(normalizeAttachment) }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  },

  delete: async (attachmentId: string): Promise<ApiResponse<void>> => {
    const { headers, token } = buildAuthHeaders()
    if (!token) return { error: "Please sign in to delete attachments." }

    try {
      const response = await fetch(`${getHost()}/Attachments/DeleteAttachment?id=${encodeURIComponent(attachmentId)}`, {
        method: "DELETE",
        headers,
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || (data && data.Success === false)) {
        const message = data?.Message || data?.message || data?.error || `Error: ${response.status}`
        return { error: message }
      }
      return { data: undefined }
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Network error" }
    }
  },

  download: async (attachmentId: string): Promise<ApiResponse<Blob>> => {
    const { headers, token } = buildAuthHeaders()
    if (!token) return { error: "Please sign in to download attachments." }

    try {
      const url = getAttachmentServeUrl(attachmentId)
      const response = await fetch(url, {
        method: "GET",
        headers,
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