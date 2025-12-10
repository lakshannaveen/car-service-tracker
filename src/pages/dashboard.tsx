

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { vehiclesApi, type Vehicle } from "@/lib/api"
import { VehicleCard } from "@/components/vehicle-card"
import { VehicleFormDialog } from "@/components/vehicle-form-dialog"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Plus, LogOut, Car } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login")
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      console.log('DashboardPage: user present, loading vehicles', { user })
      loadVehicles()
    }
  }, [user])

  useEffect(() => {
    console.log('DashboardPage: vehicles state changed', { vehicles, isArray: Array.isArray(vehicles), typeof: typeof vehicles })
  }, [vehicles])

  const loadVehicles = async () => {
    setIsLoading(true)
    console.log('loadVehicles: calling vehiclesApi.getAll')
    const { data, error } = await vehiclesApi.getAll()
    console.log('loadVehicles: response from vehiclesApi.getAll', { data, error })

    if (error) {
      console.error('loadVehicles error:', error)
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    } else if (data) {
      // Backend may wrap responses in an envelope { success, message, data }
      if (Array.isArray(data)) {
        console.log('loadVehicles: data is array, setting vehicles')
        setVehicles(data)
      } else if (data && Array.isArray((data as any).data)) {
        console.log('loadVehicles: data.data is array, setting vehicles to data.data')
        setVehicles((data as any).data)
      } else {
        console.warn('loadVehicles: unexpected payload shape for vehicles, will set to empty array', data)
        setVehicles([])
      }
    }

    setIsLoading(false)
  }

  const handleAddVehicle = () => {
    setEditingVehicle(null)
    setDialogOpen(true)
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setDialogOpen(true)
  }

  const handleSubmitVehicle = async (vehicle: Vehicle) => {
    if (editingVehicle?.vehicleId) {
      const { error } = await vehiclesApi.update(editingVehicle.vehicleId, vehicle)
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
        description: "Vehicle updated successfully",
      })
    } else {
      const { error } = await vehiclesApi.create(vehicle)
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
        description: "Vehicle added successfully",
      })
    }
    loadVehicles()
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return

    const { error } = await vehiclesApi.delete(vehicleId)
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
      description: "Vehicle deleted successfully",
    })
    loadVehicles()
  }

  const handleViewHistory = (vehicleId: string) => {
    navigate(`/history/${vehicleId}`)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-xs w-full px-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[fillRight_1s_linear_infinite]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
  <header className="md:hidden bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Vehicles</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.fullName}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Your Vehicles</h2>
          <Button onClick={handleAddVehicle} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Vehicle
          </Button>
        </div>

        {isLoading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center max-w-xs w-full px-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-primary" />
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[fillRight_1s_linear_infinite]" />
              </div>
            </div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No vehicles yet</h3>
            <p className="text-muted-foreground mb-6">Add your first vehicle to start tracking service records</p>
            <Button onClick={handleAddVehicle}>Add Your First Vehicle</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(vehicles) ? (
              vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.vehicleId}
                  vehicle={vehicle}
                  onEdit={handleEditVehicle}
                  onDelete={handleDeleteVehicle}
                  onViewHistory={handleViewHistory}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-destructive">
                Unexpected vehicles data (see console). Rendering skipped.
              </div>
            )}
          </div>
        )}
      </main>

      <VehicleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicle={editingVehicle}
        onSubmit={handleSubmitVehicle}
      />

    </div>
  )
}
