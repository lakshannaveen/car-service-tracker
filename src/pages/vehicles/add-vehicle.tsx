import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/services/auth-context"
import { vehiclesApi, type Vehicle } from "@/services"
import { MobileNav } from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

export default function AddVehiclePage() {
  const { user, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState<Vehicle>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login")
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await vehiclesApi.create(formData)

    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "Success",
      description: "Vehicle added successfully",
    })

    navigate("/dashboard")
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
  <header className="md:hidden bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add Vehicle</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
            <CardDescription>Enter the details of your vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  placeholder="Toyota"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  placeholder="Camry"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  placeholder="CAB-1234 or WP ABC-1234"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  required
                  disabled={isLoading}
                  pattern="^([A-Z]{2,3}-\d{4}|[A-Z]{2}\s[A-Z]{2,3}-\d{4})$"
                  title="Please enter a valid Sri Lankan license plate (e.g., CAB-1234 or WP ABC-1234)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Adding..." : "Add Vehicle"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <MobileNav />
    </div>
  )
}

