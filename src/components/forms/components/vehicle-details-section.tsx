import { Label } from "@/components/ui/label"

interface VehicleDetailsSectionProps {
  vehicleDetails?: {
    make: string
    model: string
    year: number
    licensePlate?: string
  }
  vehicleId: string
}

export function VehicleDetailsSection({ vehicleDetails, vehicleId }: VehicleDetailsSectionProps) {
  if (!vehicleDetails) return null

  return (
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
  )
}
