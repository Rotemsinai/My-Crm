"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function IntegrationsPage() {
  const [quickbooksConnected, setQuickbooksConnected] = useState(() => {
    // Check if QuickBooks is connected
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("qb_auth_data")
    }
    return false
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground">Connect your CRM with other services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                QuickBooks
              </CardTitle>
              {quickbooksConnected && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
            <CardDescription>Import financial data from QuickBooks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Connect your QuickBooks account to import financial data, including invoices, expenses, and financial
              reports.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/integrations/quickbooks">
                {quickbooksConnected ? "Manage Integration" : "Connect"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Add more integration cards here */}
      </div>
    </div>
  )
}
