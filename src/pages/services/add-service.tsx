import { useEffect, useState } from "react"
import { useAuth } from "@/services/auth-context"
import { vehiclesApi, serviceRecordsApi, attachmentsApi, type Vehicle, type ServiceRecord } from "@/services"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Plus, ArrowLeft, Settings, Car } from "lucide-react"
import { ServiceRecordForm } from "@/components/forms"
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
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Car className="w-8 h-8 text-primary-foreground" />
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
              {/* Top header with back to dashboard */}
              <header className="bg-card border-b border-border sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-xl font-semibold">Add Service</h1>
                  </div>
                </div>
              </header>
              <main className="container mx-auto px-3 py-6 max-w-xl">
                <Card className="border-muted shadow-sm">
                  <CardHeader>
                    <div className="bg-primary/5 rounded-2xl p-4 mb-5 border border-primary/10 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                          <Settings className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-semibold text-primary">
                            Service Details
                          </CardTitle>
                          <CardDescription className="text-muted-foreground font-medium mt-0.5 text-sm">
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
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Add Service</h1>
              <p className="text-sm text-muted-foreground">Select a vehicle to add a service record</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-xs w-full px-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-primary-foreground" />
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

