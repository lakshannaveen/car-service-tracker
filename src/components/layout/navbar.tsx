import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/services/auth-context"
import { Button } from "@/components/ui/button"
import { Car, History, LogOut, Moon, Sun } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "next-themes"

export function Navbar() {
  const location = useLocation()
  const pathname = location.pathname
  const { user, logout } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleLogout = () => {
    logout()
  }

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  return (
    <header className="hidden md:block bg-white dark:bg-neutral-900 border-b border-border sticky top-0 z-40">
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
          {/* Theme toggle */}
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="rounded-full border-muted-foreground/30 dark:border-muted-foreground/40 hover:bg-muted/50"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
          {user ? (
            <>
              <Avatar className="w-10 h-10 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold">
                  {getUserInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 rounded-lg transition-all"
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
