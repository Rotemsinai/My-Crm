"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area"

interface VendorExpensesProps {
  reportId: string | null
  reports: any[]
  vendorFilter?: string[]
}

export function VendorExpenses({ reportId, reports, vendorFilter = [] }: VendorExpensesProps) {
  // Get the selected report
  const selectedReport = reportId ? reports.find((r) => r.id === reportId) : null

  // Get the vendor breakdown from the report, or fallback to empty array
  let vendors = selectedReport?.vendorBreakdown || []

  // Apply vendor filter if provided
  if (vendorFilter.length > 0) {
    vendors = vendors.filter((vendor: any) => vendorFilter.includes(vendor.name))
  }

  // Sort vendors by amount (descending)
  vendors = [...vendors].sort((a: any, b: any) => b.amount - a.amount)

  // Take top 5 vendors for the chart
  const topVendors = vendors.slice(0, 5)

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={topVendors}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip formatter={(value: number) => [formatCurrency(value), "Amount"]} />
            <Bar dataKey="amount" fill="#8884d8" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ScrollArea className="h-[150px]">
        <div className="space-y-2">
          {vendors.map((vendor: any, index: number) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm">{vendor.name}</span>
              <span className="text-sm font-medium">{formatCurrency(vendor.amount)}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
