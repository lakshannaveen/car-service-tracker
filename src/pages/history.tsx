import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  serviceRecordsApi,
  attachmentsApi,
  vehiclesApi,
  type ServiceRecord,
  type Vehicle,
  type Attachment,
  type CostBreakdown,
} from "@/lib/api"
import { MobileNav } from "@/components/mobile-nav"
import { ServiceRecordCard } from "@/components/service-record-card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Plus, FileText, DollarSign, Calendar, Receipt } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AttachmentViewer } from "@/components/attachment-viewer"
import { ServiceRecordForm } from "@/components/service-record-form"
import { CostBreakdownModal } from "@/components/cost-breakdown-viewer"
import { MileageTimeline } from "@/components/mileage-timeline"
import { Card, CardContent } from "@/components/ui/card"
import { Car } from "lucide-react"

// Helper function to normalize cost breakdowns
function normalizeCostBreakdowns(breakdowns: any[]): CostBreakdown[] {
  if (!Array.isArray(breakdowns)) return []
  return breakdowns.map((b: any) => ({
    breakdownId: String(b.BreakdownId ?? b.breakdownId ?? b.Id ?? ""),
    recordId: String(b.RecordId ?? b.recordId ?? ""),
    itemDescription: b.ItemDescription ?? b.itemDescription ?? "",
    itemCategory: b.ItemCategory ?? b.itemCategory ?? "Other",
    quantity: Number(b.Quantity ?? b.quantity ?? 0),
    unitPrice: Number(b.UnitPrice ?? b.unitPrice ?? 0),
    totalPrice: Number(
      b.TotalPrice ??
      b.totalPrice ??
      Number(b.Quantity ?? b.quantity ?? 0) * Number(b.UnitPrice ?? b.unitPrice ?? 0)
    ),
    createdAt: b.CreatedAt ?? b.createdAt ?? undefined,
  }))
}

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [records, setRecords] = useState<ServiceRecord[]>([])
  const [attachmentsMap, setAttachmentsMap] = useState<Record<string, Attachment[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false)
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { vehicleId } = useParams()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login")
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      if (vehicleId) {
        loadData()
      } else {
        loadVehicles()
      }
    }
  }, [user, vehicleId])

  const loadVehicles = async () => {
    setIsLoading(true)
    const { data, error } = await vehiclesApi.getAll()

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else if (data) {
      setVehicles(data)
    }

    setIsLoading(false)
  }

  const loadData = async () => {
    setIsLoading(true)

    // Load vehicle
    const { data: vehiclesData } = await vehiclesApi.getAll()
    if (vehiclesData) {
      const foundVehicle = vehiclesData.find((v) => v.vehicleId === vehicleId)
      setVehicle(foundVehicle || null)
    }

    // Load service records
    const { data: recordsData, error } = await serviceRecordsApi.getAll(vehicleId)

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else {
      let rawList: any[] = []

      if (Array.isArray(recordsData)) {
        rawList = recordsData
      } else if (recordsData && Array.isArray((recordsData as any).data)) {
        rawList = (recordsData as any).data
      } else if (recordsData && Array.isArray((recordsData as any).Data)) {
        rawList = (recordsData as any).Data
      }

      const parseDotNetDate = (val: any) => {
        if (val === null || val === undefined || val === "") return ""
        if (typeof val === "number") return new Date(val).toISOString()
        if (typeof val === "string") {
          const dotNetMatch = val.match(/\/Date\((\d+)\)\//)
          if (dotNetMatch && dotNetMatch[1]) {
            return new Date(Number(dotNetMatch[1])).toISOString()
          }
          const parsed = Date.parse(val)
          if (!Number.isNaN(parsed)) return new Date(parsed).toISOString()
          return val
        }
        return String(val)
      }

      const recordsArray: ServiceRecord[] = rawList.map((r: any) => ({
        recordId: String(r.RecordId ?? r.recordId ?? r.Id ?? ""),
        vehicleId: String(r.VehicleId ?? r.vehicleId ?? r.Vehicle ?? ""),
        serviceDate: parseDotNetDate(r.ServiceDate ?? r.serviceDate ?? ""),
        serviceType: r.ServiceType ?? r.serviceType ?? "",
        providerName: r.ProviderName ?? r.providerName ?? "",
        cost: Number(r.Cost ?? r.cost ?? 0),
        description: r.Description ?? r.description ?? "",
        mileage: r.Mileage ?? r.mileage ?? undefined,
        items: Array.isArray(r.Items ?? r.items)
          ? (r.Items ?? r.items).map((i: any) => String(i))
          : [],
        costBreakdowns: normalizeCostBreakdowns(
          r.CostBreakdowns ?? r.costBreakdowns ?? []
        ),
        createdAt: parseDotNetDate(r.CreatedAt ?? r.createdAt ?? "") || undefined,
      }))

      setRecords(recordsArray)

      const attachmentsData: Record<string, Attachment[]> = {}
      for (const record of recordsArray) {
        if (record?.recordId) {
          const { data: attachments } = await attachmentsApi.getByRecordId(record.recordId)
          if (attachments && Array.isArray(attachments)) {
            attachmentsData[record.recordId] = attachments
          } else if (attachments && Array.isArray((attachments as any).data)) {
            attachmentsData[record.recordId] = (attachments as any).data
          }
        }
      }
      setAttachmentsMap(attachmentsData)
    }

    setIsLoading(false)
  }

  const handleViewAttachments = (recordId: string) => {
    setSelectedRecordId(recordId)
    setAttachmentDialogOpen(true)
  }

  const handleViewBreakdown = (recordId: string) => {
    setSelectedRecordId(recordId)
    setBreakdownDialogOpen(true)
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    const { error } = await attachmentsApi.delete(attachmentId)

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Attachment deleted successfully",
    })

    loadData()
  }

  const handleEditRecord = (record: ServiceRecord) => {
    setEditingRecord(record)
    setEditDialogOpen(true)
  }

  const handleUpdateRecord = async (record: ServiceRecord, files: File[]) => {
    if (!editingRecord?.recordId) return

    const { error } = await serviceRecordsApi.update(editingRecord.recordId, record)

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    if (files.length > 0) {
      await attachmentsApi.upload(editingRecord.recordId, files)
    }

    toast({
      title: "Success",
      description: "Service record updated successfully",
    })

    setEditDialogOpen(false)
    loadData()
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this service record?")) return

    const { error } = await serviceRecordsApi.delete(recordId)

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Service record deleted successfully",
    })

    loadData()
  }

  if (authLoading || !user) {
    return null
  }

  if (!vehicleId) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <header className="md:hidden bg-card border-b border-border sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Service History</h1>
            <p className="text-sm text-muted-foreground">View service records by vehicle</p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="text-center max-w-xs w-full px-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-primary" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-[fillRight_1.2s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No vehicles yet</h3>
              <p className="text-muted-foreground mb-6">Add a vehicle to start tracking service records</p>
              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select a Vehicle</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <Card
                    key={vehicle.vehicleId}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/history/${vehicle.vehicleId}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                        <Calendar className="w-4 h-4" />
                        <span>Year: {vehicle.year}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-xs w-full px-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[fillRight_1.2s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    )
  }

  const totalCost = records.reduce((sum, record) => sum + record.cost, 0)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <header className="md:hidden bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-sm text-muted-foreground">{vehicle.licensePlate}</p>
          </div>
          <Button size="sm" onClick={() => navigate(`/add-service/${vehicleId}`)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Service
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">{records.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1">
              <div
                className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((records.length / 20) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">Rs. {totalCost.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-xs text-green-600 font-medium">Maintenance budget</div>
          </div>

          <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Last Service</p>
                <p className="text-3xl font-bold text-gray-900">
                  {records.length > 0
                    ? new Date(records[0].serviceDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-xs text-orange-600 font-medium">
              {records.length > 0
                ? `${Math.floor(
                    (new Date().getTime() - new Date(records[0].serviceDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                  )} days ago`
                : "No records"}
            </div>
          </div>
        </div>

        {records.some((r) => r.mileage) && (
          <div className="mb-6">
            <MileageTimeline
              records={records.map((r) => ({
                ...r,
                mileage: r.mileage === null ? undefined : r.mileage,
              }))}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Service History</h2>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No service records yet</h3>
            <p className="text-muted-foreground mb-6">Start tracking services for this vehicle</p>
            <Button onClick={() => navigate(`/add-service/${vehicleId}`)}>Add First Service</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <ServiceRecordCard
                key={record.recordId}
                record={record}
                attachments={record.recordId ? attachmentsMap[record.recordId] : []}
                onEdit={handleEditRecord}
                onDelete={handleDeleteRecord}
                onViewAttachments={handleViewAttachments}
                onViewBreakdown={handleViewBreakdown}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog open={attachmentDialogOpen} onOpenChange={setAttachmentDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
            <DialogDescription>View and manage service record attachments</DialogDescription>
          </DialogHeader>
          <AttachmentViewer
            attachments={selectedRecordId ? attachmentsMap[selectedRecordId] || [] : []}
            onDelete={handleDeleteAttachment}
          />
        </DialogContent>
      </Dialog>

      {selectedRecordId && (
        <CostBreakdownModal
          breakdowns={records.find((r) => r.recordId === selectedRecordId)?.costBreakdowns || []}
          totalCost={records.find((r) => r.recordId === selectedRecordId)?.cost}
          isOpen={breakdownDialogOpen}
          onClose={() => setBreakdownDialogOpen(false)}
        />
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] p-4 sm:p-6 flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Service Record</DialogTitle>
            <DialogDescription>Update service record details and add more attachments</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <ServiceRecordForm
              vehicleId={vehicleId}
              record={editingRecord}
              onSubmit={handleUpdateRecord}
              onCancel={() => setEditDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
