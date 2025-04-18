"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatWidget } from "@/components/chat-widget"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Start with sidebar visible
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Simple toggle function
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - always in the DOM, visibility controlled by width */}
      <div
        style={{ width: sidebarOpen ? "16rem" : "0" }}
        className="h-screen overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="h-full w-64 bg-background border-r">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-4 bg-background">
          {/* Hamburger menu - always visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Suspense>
              <UserNav />
            </Suspense>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>

      <Suspense>
        <ChatWidget />
      </Suspense>
    </div>
  )
}
