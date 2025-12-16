import type React from "react"
import { useState, useEffect } from "react"
import type { ServiceRecord, CostBreakdown } from "@/services"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileUpload } from "@/components/common"
import { Loader2, Check, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getDateForInput, formatCost } from "@/utils"
import { SERVICE_TYPES, COST_CATEGORIES } from "@/constants/service-types"
import {
  VehicleDetailsSection,
  ServiceDateMileage,
  ServiceTypeProvider,
  TotalCostField,
  CostBreakdownSection,
} from "./components"

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

interface CostBreakdownFormState {
  itemDescription: string
  itemCategory: "Labor" | "Parts" | "Fluids" | "Other"
  quantity: number | string
  unitPrice: number | string
}

export function ServiceRecordForm({ vehicleId, vehicleDetails, record, onSubmit, onCancel }: ServiceRecordFormProps) {
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<ServiceRecord>(
    record ? {
      ...record,
      serviceDate: getDateForInput(record.serviceDate)
    } : {
      vehicleId,
      serviceDate: new Date().toISOString().split("T")[0],
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
  const [manualCostOverride, setManualCostOverride] = useState<number | null>(record?.cost || null)

  const totalBreakdownCost = costBreakdowns.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  
  // Auto-update total cost when breakdown items change
  useEffect(() => {
    if (costBreakdowns.length > 0) {
      setManualCostOverride(totalBreakdownCost)
    }
  }, [totalBreakdownCost, costBreakdowns.length])

  const displayedCost = manualCostOverride !== null ? manualCostOverride : (costBreakdowns.length > 0 ? totalBreakdownCost : formData.cost)

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
      toast({
        title: "Success",
        description: "Cost item updated successfully",
      })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const submitData: ServiceRecord = {
      ...formData,
      costBreakdowns: costBreakdowns.length > 0 ? costBreakdowns : undefined,
      cost: manualCostOverride !== null ? manualCostOverride : (costBreakdowns.length > 0 ? totalBreakdownCost : formData.cost),
    }

    await onSubmit(submitData, files)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <VehicleDetailsSection vehicleDetails={vehicleDetails} vehicleId={vehicleId} />

      <ServiceDateMileage
        serviceDate={formData.serviceDate}
        mileage={formData.mileage}
        isLoading={isLoading}
        onServiceDateChange={(date) => setFormData({ ...formData, serviceDate: date })}
        onMileageChange={(mileage) => setFormData({ ...formData, mileage })}
      />

      <ServiceTypeProvider
        serviceType={formData.serviceType}
        providerName={formData.providerName}
        isLoading={isLoading}
        onServiceTypeChange={(type) => setFormData({ ...formData, serviceType: type })}
        onProviderNameChange={(name) => setFormData({ ...formData, providerName: name })}
      />

      <TotalCostField 
        displayedCost={displayedCost} 
        isLoading={isLoading}
        onChange={(value) => {
          setManualCostOverride(value)
          setFormData({ ...formData, cost: value })
        }}
        hasBreakdowns={costBreakdowns.length > 0}
      />

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
      <CostBreakdownSection
        costBreakdowns={costBreakdowns}
        breakdownDialogOpen={breakdownDialogOpen}
        setBreakdownDialogOpen={setBreakdownDialogOpen}
        breakdownFormData={breakdownFormData}
        setBreakdownFormData={setBreakdownFormData}
        editingBreakdownIndex={editingBreakdownIndex}
        setEditingBreakdownIndex={setEditingBreakdownIndex}
        onAddBreakdown={handleAddBreakdown}
        onEditBreakdown={handleEditBreakdown}
        onDeleteBreakdown={handleDeleteBreakdown}
        isLoading={isLoading}
        totalCost={manualCostOverride !== null ? manualCostOverride : undefined}
      />

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