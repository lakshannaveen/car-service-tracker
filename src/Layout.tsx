import React from "react"
import { useLocation } from "react-router-dom"

import { AuthProvider } from "@/services/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { videos } from "@/assets"
// import "./globals.css" // Already imported in main.tsx
import { Navbar } from "@/components/layout"

// Fonts are handled in index.html via Google Fonts CDN
// We can use standard class names or font-family styles if needed, but Tailwind config should handle it if set up.
// Looking at the original file: plusJakartaSans.className adds a class.
// We should check tailwind config or globals.css to see how fonts are mapped.
// In globals.css: --font-sans: 'Plus Jakarta Sans', ...
// So we can just use `font-sans` class or rely on body default.

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const location = useLocation()
  const hideNavbar = ["/login", "/register"].includes(location.pathname)

  return (
    <>
      <div className={`font-sans antialiased relative min-h-screen`}>
        {/* Background Video */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute min-w-full min-h-full object-cover"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.6, // Reduced opacity further
            }}
          >
            <source src={videos.vehi} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Darker overlay for better text contrast */}
          <div className="absolute inset-0 bg-linear-to-br from-black/20 to-black/10 backdrop-blur-[2px]"></div>
        </div>

        <AuthProvider>
          <div className="relative z-10 min-h-screen flex flex-col">
            {!hideNavbar && <Navbar />}
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster />
        </AuthProvider>
      </div>
    </>
  )
}
