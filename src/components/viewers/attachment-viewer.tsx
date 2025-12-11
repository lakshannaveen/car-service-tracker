

import type { Attachment } from "@/services/api"
import { getAttachmentServeUrl } from "@/services/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, ImageIcon, X } from "lucide-react"

interface AttachmentViewerProps {
  attachments: Attachment[]
  onDelete?: (attachmentId: string) => void
}

export function AttachmentViewer({ attachments, onDelete }: AttachmentViewerProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const isImage = (fileName: string) => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
    return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext))
  }

  const handleOpenPreview = async (attachment: Attachment) => {
    // If backend exposes a serve endpoint that requires auth, fetch the file with the auth header
    if (attachment.attachmentId) {
      try {
        const url = getAttachmentServeUrl(attachment.attachmentId)
        const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null

        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = `Bearer ${token}`

        const resp = await fetch(url, { headers })
        if (resp.status === 401) {
          alert("Unauthorized: please log in")
          return
        }
        if (resp.status === 403) {
          alert("Forbidden: you don't have access to this attachment")
          return
        }
        if (resp.status === 404) {
          alert("Attachment not found")
          return
        }
        if (!resp.ok) {
          alert("Unable to preview attachment: server error")
          return
        }

        const blob = await resp.blob()
        const objectUrl = URL.createObjectURL(blob)
        window.open(objectUrl, "_blank")

        // Revoke object URL after some time to avoid memory leak (allow tab to load)
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60 * 1000)
        return
      } catch (err) {
        alert("Preview error: " + (err instanceof Error ? err.message : String(err)))
        return
      }
    }

    // Fallback: Preview images in a new tab if filePath is a public URL or relative path.
    if (attachment.filePath && (attachment.filePath.startsWith("http") || attachment.filePath.startsWith("/"))) {
      window.open(attachment.filePath, "_blank")
      return
    }

    // If filePath is a local filesystem path (C:\...), browser cannot access it.
    alert("Preview unavailable: the server must expose a public URL for attachments to preview them in the browser.")
  }

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <File className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No attachments</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {attachments.map((attachment) => (
        <Card key={attachment.attachmentId} className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center shrink-0">
              {isImage(attachment.fileName) ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <File className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.fileName}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(attachment.fileSize)}</p>
              <div className="flex gap-2 mt-2">
                {isImage(attachment.fileName) && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleOpenPreview(attachment)}>
                    <ImageIcon className="w-3 h-3 mr-1" />
                    View
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => onDelete(attachment.attachmentId)}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
