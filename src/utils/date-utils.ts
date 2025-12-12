export const getDateForInput = (dateString?: string): string => {
  if (!dateString) return new Date().toISOString().split("T")[0]
  return dateString.includes("T") ? dateString.split("T")[0] : dateString
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
}

export const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return ""
  const datePart = dateString.includes("T") ? dateString.split("T")[0] : dateString
  return datePart.replace(/-/g, "/")
}

export const formatDateForStorage = (displayDate: string): string => {
  if (!displayDate) return ""
  return displayDate.replace(/\//g, "-")
}
