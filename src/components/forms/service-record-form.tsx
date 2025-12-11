import type React from "react"
import { useState } from "react"
import type { ServiceRecord, CostBreakdown } from "@/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/common"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Plus, Loader2, Check, Receipt, Edit, Info, Banknote } from "lucide-react"

interface ServiceRecordFormProps {
  vehicleId: string
  vehicleDetails?: {
    make: string
    model: string
    year: number
    licensePlate?: string
  }
  record?: ServiceRecord | null
  onSubmit: (record: ServiceRecord, files: File[]) => Promise<void>
  onCancel: () => void
}

const serviceTypes = [
  "Oil Change",
  "Tire Rotation",
  "Brake Service",
  "Engine Tune-up",
  "Transmission Service",
  "Battery Replacement",
  "Air Filter Replacement",
  "Inspection",
  "Repair",
  "Other",
]
// date formatting helper

// const formatDate = (value: string | Date): string => {
//   const date = new Date(value);
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

const costCategories = ["Labor", "Parts", "Fluids", "Other"] as const

interface CostBreakdownFormState {
  itemDescription: string
  itemCategory: "Labor" | "Parts" | "Fluids" | "Other"
  quantity: number | string
  unitPrice: number | string
}

export function ServiceRecordForm({ vehicleId, vehicleDetails, record, onSubmit, onCancel }: ServiceRecordFormProps) {
  const [formData, setFormData] = useState<ServiceRecord>(
    record || {
      vehicleId,
      serviceDate: new Date().toISOString().split("T")[0],
      // serviceDate: formatDate(new Date()),
      serviceType: "",
      providerName: "",
      cost: 0,
      description: "",
      mileage: undefined,
      costBreakdowns: [],
      items: [],
    }
  )

  const [costBreakdowns, setCostBreakdowns] = useState<CostBreakdown[]>(record?.costBreakdowns || [])
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
  const [editingBreakdownIndex, setEditingBreakdownIndex] = useState<number | null>(null)
  const [breakdownFormData, setBreakdownFormData] = useState<CostBreakdownFormState>({
    itemDescription: "",
    itemCategory: "Labor",
    quantity: 1,
    unitPrice: 0,
  })

  // Format number with commas for thousands
  const formatNumberWithCommas = (value: number): string => {
    return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  // Parse formatted number back to number
  const parseFormattedNumber = (formattedValue: string): number => {
    return parseFloat(formattedValue.replace(/,/g, '')) || 0
  }

  // Format cost for display
  const formatCost = (cost: number): string => {
    return formatNumberWithCommas(cost)
  }

  // Format date from various inputs to display as yyyy/mm/dd
  // Handles ISO datetimes like 2025-11-26T18:30:00.000Z and plain yyyy-mm-dd
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ""
    // If it's an ISO datetime, take the date portion before the 'T'
    const datePart = dateString.includes("T") ? dateString.split("T")[0] : dateString
    return datePart.replace(/-/g, "/")
  }

  // Convert display format yyyy/mm/dd back to yyyy-mm-dd for storage
  const formatDateForStorage = (displayDate: string): string => {
    if (!displayDate) return ""
    return displayDate.replace(/\//g, "-")
  }

  const handleAddBreakdown = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!breakdownFormData.itemDescription || !breakdownFormData.itemCategory) {
      alert("Please fill in all fields")
      return
    }

    const quantity = Number(breakdownFormData.quantity)
    const unitPrice = Number(breakdownFormData.unitPrice)

    if (quantity <= 0 || unitPrice < 0) {
      alert("Quantity must be greater than 0 and unit price must be non-negative")
      return
    }

    const newBreakdown: CostBreakdown = {
      itemDescription: String(breakdownFormData.itemDescription),
      itemCategory: breakdownFormData.itemCategory as any,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice,
    }

    if (editingBreakdownIndex !== null) {
      const updated = [...costBreakdowns]
      updated[editingBreakdownIndex] = newBreakdown
      setCostBreakdowns(updated)
      setEditingBreakdownIndex(null)
    } else {
      setCostBreakdowns([...costBreakdowns, newBreakdown])
    }

    setBreakdownFormData({
      itemDescription: "",
      itemCategory: "Labor",
      quantity: 1,
      unitPrice: 0,
    })
    setBreakdownDialogOpen(false)
  }

  const handleEditBreakdown = (index: number) => {
    const breakdown = costBreakdowns[index]
    setBreakdownFormData({
      itemDescription: breakdown.itemDescription,
      itemCategory: breakdown.itemCategory,
      quantity: breakdown.quantity,
      unitPrice: breakdown.unitPrice,
    })
    setEditingBreakdownIndex(index)
    setBreakdownDialogOpen(true)
  }

  const handleDeleteBreakdown = (index: number) => {
    setCostBreakdowns(costBreakdowns.filter((_, i) => i !== index))
  }

  const totalBreakdownCost = costBreakdowns.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    const submitData: ServiceRecord = {
      ...formData,
      costBreakdowns: costBreakdowns.length > 0 ? costBreakdowns : undefined,
      cost: costBreakdowns.length > 0 ? totalBreakdownCost : formData.cost,
    }

    await onSubmit(submitData, files)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Vehicle Details Section */}
      {vehicleDetails && (
        <div className="bg-linear-to-r from-primary/5 to-primary/10 p-6 rounded-lg border-2 border-primary/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Vehicle</Label>
              <p className="text-lg font-semibold">
                {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}
              </p>
            </div>
            {vehicleDetails.licensePlate && (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">License Plate</Label>
                <p className="text-lg font-semibold">{vehicleDetails.licensePlate}</p>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">Vehicle ID</Label>
              <p className="text-lg font-semibold">{vehicleId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Service Date and Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="serviceDate" className="text-sm font-medium">Service Date *</Label>
          <Input
            id="serviceDate"
            type="date"
            value={formData.serviceDate}
            onChange={(e) => {
              setFormData({ ...formData, serviceDate: e.target.value })
            }}
            required
            disabled={isLoading}
            className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="mileage" className="text-sm font-medium">Mileage</Label>
          <Input
            id="mileage"
            type="number"
            min="0"
            placeholder="Current vehicle mileage"
            value={formData.mileage || ""}
            onChange={(e) => setFormData({ ...formData, mileage: e.target.value ? Number(e.target.value) : undefined })}
            disabled={isLoading}
            className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Service Type and Provider */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="serviceType" className="text-sm font-medium">Service Type *</Label>
          <Select
            value={formData.serviceType}
            onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
            disabled={isLoading}
            required
          >
            <SelectTrigger id="serviceType" className="h-11 transition-colors focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent side="bottom" align="start" className="max-h-[300px]">
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="providerName" className="text-sm font-medium">Service Provider *</Label>
          <Input
            id="providerName"
            placeholder="Auto Shop Name"
            value={formData.providerName}
            onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
            required
            disabled={isLoading}
            className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Cost */}
      <div className="space-y-3">
        <Label htmlFor="cost" className="text-sm font-medium">Total Cost *</Label>
        <Input
          id="cost"
          type="text"
          placeholder="0.00"
          value={formatCost(formData.cost)}
          onChange={(e) => {
            const numericValue = parseFormattedNumber(e.target.value)
            setFormData({ ...formData, cost: numericValue })
          }}
          required
          disabled={isLoading}
          className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
        />
        {costBreakdowns.length > 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            Tip: You can manually enter a total or use the breakdown calculation below
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-3">
        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
        <Textarea
          id="description"
          placeholder="Additional notes about the service..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          disabled={isLoading}
          className="resize-none transition-colors focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Cost Breakdowns Section */}
      <Card className="border-2 border-muted/50 bg-linear-to-br from-background to-muted/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Cost Breakdown
              </CardTitle>
              <CardDescription>
                Itemize your service costs for better tracking
              </CardDescription>
            </div>
            <Dialog open={breakdownDialogOpen} onOpenChange={setBreakdownDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setEditingBreakdownIndex(null)
                    setBreakdownFormData({
                      itemDescription: "",
                      itemCategory: "Labor",
                      quantity: 1,
                      unitPrice: 0,
                    })
                  }}
                  disabled={isLoading}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Add Cost Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    {editingBreakdownIndex !== null ? "Edit Cost Item" : "Add Cost Item"}
                  </DialogTitle>
                  <DialogDescription>
                    Add itemized costs for this service record
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddBreakdown} className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <Label htmlFor="itemDescription">Description</Label>
                    <Input
                      id="itemDescription"
                      placeholder="e.g., Synthetic Oil, Air Filter, Labor"
                      value={breakdownFormData.itemDescription}
                      onChange={(e) =>
                        setBreakdownFormData({
                          ...breakdownFormData,
                          itemDescription: e.target.value,
                        })
                      }
                      required
                      className="transition-colors focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="itemCategory">Category</Label>
                    <Select
                      value={breakdownFormData.itemCategory}
                      onValueChange={(value) =>
                        setBreakdownFormData({
                          ...breakdownFormData,
                          itemCategory: value as "Labor" | "Parts" | "Fluids" | "Other",
                        })
                      }
                      required
                    >
                      <SelectTrigger id="itemCategory" className="transition-colors focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {costCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="1"
                        value={breakdownFormData.quantity}
                        onChange={(e) =>
                          setBreakdownFormData({
                            ...breakdownFormData,
                            quantity: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        required
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="unitPrice">Unit Price</Label>
                      <Input
                        id="unitPrice"
                        type="text"
                        inputMode="decimal"
                        min="0"
                        placeholder="0.00"
                        value={breakdownFormData.unitPrice === 0 ? "" : breakdownFormData.unitPrice}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, "");
                          setBreakdownFormData({
                            ...breakdownFormData,
                            unitPrice: value === "" ? "" : Number(value),
                          })
                        }}
                        required
                        className="transition-colors focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <Label className="text-sm">Total Price</Label>
                    <div className="text-xl font-bold text-primary">
                      {formatCost((Number(breakdownFormData.quantity) || 0) * (Number(breakdownFormData.unitPrice) || 0))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBreakdownDialogOpen(false)}
                      className="flex-1 w-full"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 w-full gap-2">
                      {editingBreakdownIndex !== null ? (
                        <>
                          <Check className="w-4 h-4" />
                          Update
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add Item
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        {costBreakdowns.length > 0 ? (
          <CardContent className="space-y-4">
            <div className="border-2 border-muted/30 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="py-3 font-semibold">Description</TableHead>
                    <TableHead className="py-3 font-semibold">Category</TableHead>
                    <TableHead className="py-3 font-semibold text-right">Qty</TableHead>
                    <TableHead className="py-3 font-semibold text-right">Unit Price</TableHead>
                    <TableHead className="py-3 font-semibold text-right">Total</TableHead>
                    <TableHead className="py-3 text-center w-14"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costBreakdowns.map((breakdown, index) => (
                    <TableRow key={index} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="py-3 font-medium">{breakdown.itemDescription}</TableCell>
                      <TableCell className="py-3">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${breakdown.itemCategory === "Labor" ? "border-blue-200 bg-blue-50 text-blue-700" :
                              breakdown.itemCategory === "Parts" ? "border-green-200 bg-green-50 text-green-700" :
                              breakdown.itemCategory === "Fluids" ? "border-purple-200 bg-purple-50 text-purple-700" :
                              "border-gray-200 bg-gray-50 text-gray-700"}
                          `}
                        >
                          {breakdown.itemCategory}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-right">{breakdown.quantity}</TableCell>
                      <TableCell className="py-3 text-right">{formatCost(breakdown.unitPrice)}</TableCell>
                      <TableCell className="py-3 text-right font-semibold">
                        {formatCost(breakdown.totalPrice || 0)}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEditBreakdown(index)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBreakdown(index)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between bg-linear-to-r from-primary/5 to-primary/10 p-4 rounded-lg border-2 border-primary/10">
              <span className="font-semibold text-lg">Subtotal from Breakdown:</span>
              <span className="text-xl font-bold text-primary">{formatCost(totalBreakdownCost)}</span>
            </div>
          </CardContent>
        ) : (
          <CardContent className="text-center py-8">
            <div className="flex flex-col items-center space-y-3 text-muted-foreground">
              <Receipt className="w-12 h-12 opacity-40" />
              <p className="font-medium">No cost items added</p>
              <p className="text-sm">Click "Add Item" to break down the service costs</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Attachments */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Attachments</Label>
        <FileUpload
          files={files}
          onFilesChange={setFiles}
          maxFiles={10}
          acceptedTypes={["image/*", "application/pdf"]}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 w-full h-12 border-2 hover:bg-muted/50 transition-all"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="flex-1 w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold transition-all gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {record ? "Updating..." : "Creating..."}
            </>
          ) : record ? (
            <>
              <Check className="w-4 h-4" />
              Update Record
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Record
            </>
          )}
        </Button>
      </div>
    </form>
  )
}