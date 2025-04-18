"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface VendorExpensesChartProps {
  dateRange: {
    from: Date
    to: Date
  }
  filters: {
    reports: string[]
    categories?: string[]
    vendors?: string[]
  }
}

export function VendorExpensesChart({ dateRange, filters }: VendorExpensesChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Load data from reports in localStorage
    const reports = JSON.parse(localStorage.getItem("reports") || "[]")

    // Filter reports by selected reports and type
    const filteredReports = reports.filter((report: any) => {
      // Include if "all" is selected or if this report is specifically selected
      const isReportSelected = filters.reports.includes("all") || filters.reports.includes(report.id)
      // Only include financial reports
      const isFinancialReport = report.type === "financial"
      return isReportSelected && isFinancialReport
    })

    // Extract vendor data from reports
    const vendorData: Record<string, { amount: number; category: string }> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.vendors) {
        report.data.vendors.forEach((vendor: any) => {
          // Filter vendors if needed
          if (
            !filters.vendors ||
            filters.vendors.includes("all") ||
            filters.vendors.includes(vendor.name.toLowerCase().replace(/\s+/g, "-"))
          ) {
            // Filter categories if needed
            if (
              !filters.categories ||
              filters.categories.includes("all") ||
              filters.categories.includes(vendor.category.toLowerCase().replace(/\s+/g, "-"))
            ) {
              if (!vendorData[vendor.name]) {
                vendorData[vendor.name] = { amount: 0, category: vendor.category }
              }
              vendorData[vendor.name].amount += vendor.amount
            }
          }
        })
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(vendorData)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        category: data.category,
      }))
      .sort((a, b) => b.amount - a.amount) // Sort by amount descending
      .slice(0, 10) // Take top 10 vendors

    // If no data from reports, use sample data
    if (chartData.length === 0) {
      setData([
        { name: "ABC Supplies", amount: 6500, category: "Parts & Materials" },
        { name: "XYZ Tools", amount: 3200, category: "Parts & Materials" },
        { name: "Facebook Ads", amount: 3500, category: "Marketing" },
        { name: "Google Ads", amount: 2800, category: "Marketing" },
        { name: "Thumbtack", amount: 1700, category: "Marketing" },
        { name: "Office Depot", amount: 1200, category: "Office & Admin" },
      ])
    } else {
      setData(chartData)
    }
  }, [dateRange, filters])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" />
        <Tooltip formatter={(value) => [formatCurrency(value as number), "Expense"]} />
        <Legend />
        <Bar dataKey="amount" name="Expense" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}
