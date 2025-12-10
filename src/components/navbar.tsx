import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Car, History, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const location = useLocation()
  const pathname = location.pathname
  const { user, logout } = useAuth()

  return (
    <header className="hidden md:block bg-white border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* LEFT SECTION WITH CAR ICON IN CIRCLE + TITLE */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <Link to="/dashboard" className="text-lg font-semibold">
            Car Service Tracker
          </Link>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-muted-foreground">
                Welcome, {user.fullName}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="
                  flex items-center gap-2 
                  text-muted-foreground 
                  bg-transparent border-transparent 
                  hover:text-red-600 
                  hover:bg-transparent 
                  hover:border-transparent
                "
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button 
                  size="sm" 
                  variant="default" 
                  className="font-medium rounded-full px-4 flex items-center gap-2"
                >
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Car className="w-3 h-3 text-primary-foreground" />
                  </div>
                  Sign in
                </Button>
              </Link>

              <Link to="/register">
                <Button
                  size="sm"
                  variant="outline"
                  className="
                    font-medium rounded-full px-4 
                    border-muted-foreground 
                    text-muted-foreground 
                    hover:border-primary 
                    hover:text-primary
                  "
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
