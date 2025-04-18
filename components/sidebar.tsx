"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  BarChart,
  Calendar,
  CreditCard,
  DollarSign,
  Home,
  Layers,
  LayoutDashboard,
  Megaphone,
  Settings,
  ShoppingCart,
  Users,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  Plug,
  Calculator,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [activeGroup, setActiveGroup] = useState<string | null>("dashboard")

  const toggleGroup = (group: string) => {
    setActiveGroup(activeGroup === group ? null : group)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-6">
        <div className="flex items-center space-x-2">
          <Image src="/images/mrs-logo.png" alt="MRS Logo" width={40} height={40} />
          <h2 className="text-lg font-bold">Customer Relationship</h2>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="space-y-1 px-2">
          <div>
            <button
              onClick={() => toggleGroup("dashboard")}
              className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                activeGroup === "dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </div>
              <span>{activeGroup === "dashboard" ? "-" : "+"}</span>
            </button>
            {activeGroup === "dashboard" && (
              <div className="mt-1 pl-6 space-y-1">
                <Link
                  href="/"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Overview</span>
                </Link>
                <Link
                  href="/financial"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/financial") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>Financial</span>
                </Link>
                <Link
                  href="/marketing"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/marketing") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Megaphone className="mr-2 h-4 w-4" />
                  <span>Marketing</span>
                </Link>
                <Link
                  href="/tasks"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/tasks") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Layers className="mr-2 h-4 w-4" />
                  <span>Tasks</span>
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleGroup("financial")}
              className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                activeGroup === "financial" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Financial</span>
              </div>
              <span>{activeGroup === "financial" ? "-" : "+"}</span>
            </button>
            {activeGroup === "financial" && (
              <div className="mt-1 pl-6 space-y-1">
                <Link
                  href="/financial/reports"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/financial/reports")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Reports</span>
                </Link>
                <Link
                  href="/financial/income"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/financial/income")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Income Analysis</span>
                </Link>
                <Link
                  href="/financial/expenses"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/financial/expenses")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Expense Analysis</span>
                </Link>
                <Link
                  href="/financial/profitability"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/financial/profitability")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <PieChart className="mr-2 h-4 w-4" />
                  <span>Profitability</span>
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleGroup("marketing")}
              className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                activeGroup === "marketing" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center">
                <Megaphone className="mr-2 h-4 w-4" />
                <span>Marketing</span>
              </div>
              <span>{activeGroup === "marketing" ? "-" : "+"}</span>
            </button>
            {activeGroup === "marketing" && (
              <div className="mt-1 pl-6 space-y-1">
                <Link
                  href="/marketing/leads"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/marketing/leads") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>Leads</span>
                </Link>
                <Link
                  href="/marketing/campaigns"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/marketing/campaigns")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Campaigns</span>
                </Link>
                <Link
                  href="/marketing/platforms"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/marketing/platforms")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Platforms</span>
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleGroup("integrations")}
              className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                activeGroup === "integrations" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center">
                <Plug className="mr-2 h-4 w-4" />
                <span>Integrations</span>
              </div>
              <span>{activeGroup === "integrations" ? "-" : "+"}</span>
            </button>
            {activeGroup === "integrations" && (
              <div className="mt-1 pl-6 space-y-1">
                <Link
                  href="/integrations/quickbooks"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/integrations/quickbooks")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  <span>QuickBooks</span>
                </Link>
              </div>
            )}
          </div>

          <div>
            <button
              onClick={() => toggleGroup("performancePay")}
              className={`w-full flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md ${
                activeGroup === "performancePay" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex items-center">
                <Calculator className="mr-2 h-4 w-4" />
                <span>Performance Pay</span>
              </div>
              <span>{activeGroup === "performancePay" ? "-" : "+"}</span>
            </button>
            {activeGroup === "performancePay" && (
              <div className="mt-1 pl-6 space-y-1">
                <Link
                  href="/performance-pay/dashboard"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/performance-pay/dashboard")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/performance-pay/rules"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/performance-pay/rules")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Commission Rules</span>
                </Link>
                <Link
                  href="/performance-pay/reports"
                  className={`flex items-center px-2 py-1 text-sm rounded-md ${
                    isActive("/performance-pay/reports")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Reports</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/calendar"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive("/calendar") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </Link>

          <Link
            href="/settings"
            className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive("/settings") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </nav>
      </div>
    </div>
  )
}
