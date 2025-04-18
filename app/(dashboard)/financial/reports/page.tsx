"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"
import Link from "next/link"

export default function FinancialReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Financial Reports</h2>
        <p className="text-muted-foreground">View and analyze your financial reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>Access your financial reports and data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>View your imported financial data and reports.</p>
            <Link href="/reports/tables">
              <Button>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                View Imported Tables
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
