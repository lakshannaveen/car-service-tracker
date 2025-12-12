import type { ServiceRecord } from "@/services"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ServiceDateMileageProps {
  serviceDate: string
  mileage: number | null | undefined
  isLoading: boolean
  onServiceDateChange: (date: string) => void
  onMileageChange: (mileage: number | undefined) => void
}

export function ServiceDateMileage({
  serviceDate,
  mileage,
  isLoading,
  onServiceDateChange,
  onMileageChange,
}: ServiceDateMileageProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label htmlFor="serviceDate" className="text-sm font-medium">
          Service Date *
        </Label>
        <Input
          id="serviceDate"
          type="date"
          value={serviceDate}
          onChange={(e) => onServiceDateChange(e.target.value)}
          required
          disabled={isLoading}
          className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="mileage" className="text-sm font-medium">
          Mileage
        </Label>
        <Input
          id="mileage"
          type="number"
          min="0"
          placeholder="Current vehicle mileage"
          value={mileage || ""}
          onChange={(e) => onMileageChange(e.target.value ? Number(e.target.value) : undefined)}
          disabled={isLoading}
          className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  )
}
