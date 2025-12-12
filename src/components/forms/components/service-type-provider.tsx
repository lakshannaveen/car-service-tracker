import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SERVICE_TYPES } from "@/constants/service-types"

interface ServiceTypeProviderProps {
  serviceType: string
  providerName: string
  isLoading: boolean
  onServiceTypeChange: (type: string) => void
  onProviderNameChange: (name: string) => void
}

export function ServiceTypeProvider({
  serviceType,
  providerName,
  isLoading,
  onServiceTypeChange,
  onProviderNameChange,
}: ServiceTypeProviderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Label htmlFor="serviceType" className="text-sm font-medium">
          Service Type *
        </Label>
        <Select value={serviceType} onValueChange={onServiceTypeChange} disabled={isLoading} required>
          <SelectTrigger id="serviceType" className="h-11 transition-colors focus:ring-2 focus:ring-primary/20">
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent side="bottom" align="start" className="max-h-[300px]">
            {SERVICE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="providerName" className="text-sm font-medium">
          Service Provider *
        </Label>
        <Input
          id="providerName"
          placeholder="Auto Shop Name"
          value={providerName}
          onChange={(e) => onProviderNameChange(e.target.value)}
          required
          disabled={isLoading}
          className="h-11 transition-colors focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  )
}
