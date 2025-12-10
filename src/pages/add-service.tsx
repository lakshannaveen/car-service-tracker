import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { vehiclesApi, serviceRecordsApi, attachmentsApi, type Vehicle, type ServiceRecord } from "@/lib/api"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Plus, ArrowLeft, Settings, Car } from "lucide-react"
import { ServiceRecordForm } from "@/components/service-record-form"
import { useToast } from "@/hooks/use-toast"

export default function AddServicePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login")
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) loadVehicles()
  }, [user])

  const loadVehicles = async () => {
    setIsLoading(true)
    const { data, error } = await vehiclesApi.getAll()
    if (error) {
      console.error("AddServicePage: failed to load vehicles", error)
      setVehicles([])
      toast({ title: "Error", description: error, variant: "destructive" })
    } else if (data) {
      setVehicles(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (record: ServiceRecord, files: File[]) => {
      if (!vehicleId) return;

      const { error, data } = await serviceRecordsApi.create({
          ...record,
          vehicleId: vehicleId
      })

      if (error) {
          toast({ title: "Error", description: error, variant: "destructive" })
          return
      }

      if (data && data.recordId && files.length > 0) {
          const { error: uploadError } = await attachmentsApi.upload(data.recordId, files)
          if (uploadError) {
              toast({ title: "Warning", description: "Record created but file upload failed: " + uploadError, variant: "destructive" })
          }
      }

      toast({ title: "Success", description: "Service record added successfully" })
      navigate(`/history/${vehicleId}`)
  }

  if (authLoading || !user) return null

  if (vehicleId) {
      const vehicle = vehicles.find(v => v.vehicleId === vehicleId)
      
      // If vehicles are loading, show loading
      if (isLoading) {
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

      // If vehicle not found (and not loading), show error or redirect
      if (!vehicle && !isLoading) {
          return (
              <div className="container mx-auto px-4 py-6 text-center">
                  <p className="text-destructive mb-4">Vehicle not found.</p>
                  <Button onClick={() => navigate("/add-service")}>Back to List</Button>
              </div>
          )
      }

      return (
          <div className="min-h-screen bg-background pb-20 md:pb-8">
              <header className="bg-card border-b border-border sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Add Service Record</h1>
                        <p className="text-sm text-muted-foreground">
                            {vehicle?.make} {vehicle?.model}
                        </p>
                    </div>
                </div>
              </header>
              <main className="container mx-auto px-4 py-6 max-w-2xl">
                <Card>
                  <CardHeader>
                    <div className="bg-linear-to-r from-blue-50/50 to-purple-50/30 rounded-2xl p-6 mb-6 border border-blue-100/50 backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center border border-blue-200/30">
                          <Settings className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Service Details
                          </CardTitle>
                          <CardDescription className="text-gray-600 font-medium mt-1">
                            Record a new service for this vehicle
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ServiceRecordForm 
                        vehicleId={vehicleId} 
                        vehicleDetails={vehicle}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate("/dashboard")}
                    />
                  </CardContent>
                </Card>
              </main>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
  <header className="md:hidden bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Add Service</h1>
            <p className="text-sm text-muted-foreground">Select a vehicle to add a service record</p>
          </div>
          <Link to="/add-vehicle">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
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
            <p className="text-muted-foreground mb-4">No vehicles found. Add a vehicle first.</p>
            <Link to="/add-vehicle">
              <Button>Add Vehicle</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <Card key={v.vehicleId} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>
                    {v.make} {v.model}
                  </CardTitle>
                  <CardDescription>{v.licensePlate}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link to={`/add-service/${v.vehicleId}`} className="flex-1">
                      <Button className="w-full">Add Service</Button>
                    </Link>
                    <Button variant="ghost" onClick={() => navigate(`/history/${v.vehicleId}`)}>
                      View History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
