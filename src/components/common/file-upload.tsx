import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Upload, File, ImageIcon } from "lucide-react"
import { cn } from "@/utils/utils"

interface FileUploadProps {
  files: File[]
  onFilesChange: (files: File[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export function FileUpload({ files, onFilesChange, maxFiles = 10, acceptedTypes }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    addFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const remainingSlots = maxFiles - files.length
    const filesToAdd = newFiles.slice(0, remainingSlots)

    // Only allow jpg, jpeg, png
    const allowedTypes = [
      "image/jpeg", "image/png"
    ];
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const validFiles = filesToAdd.filter((file) => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return allowedTypes.includes(file.type) && allowedExtensions.includes(ext);
    });
    if (validFiles.length < filesToAdd.length) {
      alert("Only jpg, jpeg, and png files are allowed.");
    }
    onFilesChange([...files, ...validFiles])
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const isImage = (file: File) => file.type.startsWith("image/")

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="p-4 text-center">
          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" /> {/* mb-3 for a bit less space */}
          <p className="text-sm font-medium mb-1">
            {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedTypes ? `Accepted: ${acceptedTypes.join(", ")}` : "Images, PDFs, and documents"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {files.length} / {maxFiles} files selected
          </p>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes?.join(",")}
        onChange={handleFileSelect}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({files.length})</p>
          <div className="grid gap-2">
            {files.map((file, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center shrink-0">
                    {isImage(file) ? (
                      <ImageIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <File className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}