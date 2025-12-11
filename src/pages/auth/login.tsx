import type React from "react"

import { useState } from "react"
import { useAuth } from "@/services/auth-context"
import { authApi } from "@/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"
import { Car, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.debug('LoginPage: submitting', { email })
    const { data, error } = await authApi.login({ email, password })
    console.debug('LoginPage: authApi.login response', { data, error })

    if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (data) {
      login(data.token, {
        userId: data.userId,
        email: data.email,
        fullName: data.fullName,
      })

      setTimeout(() => {
        console.debug('LoginPage: localStorage after login', {
          authToken: localStorage.getItem('authToken'),
          userData: localStorage.getItem('userData'),
        })
      }, 50)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Car className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to manage your vehicle service records</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Email"
                style={{ fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder="Password"
                  style={{ fontSize: "0.9rem" }}
                />

                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center px-2 py-1 rounded"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  style={{ fontSize: '0.85rem', background: 'none', boxShadow: 'none' }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

