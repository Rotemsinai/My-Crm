"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ExpensesByCategoryChartProps {
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

export function ExpensesByCategoryChart({ dateRange, filters }: ExpensesByCategoryChartProps) {
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

    // Extract expense categories from reports
    const categoryData: Record<string, number> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.expenseCategories) {
        report.data.expenseCategories.forEach((category: any) => {
          // Filter categories if needed
          if (
            !filters.categories ||
            filters.categories.includes("all") ||
            filters.categories.includes(category.category.toLowerCase().replace(/\s+/g, "-"))
          ) {
            if (!categoryData[category.category]) {
              categoryData[category.category] = 0
            }
            categoryData[category.category] += category.amount
          }
        })
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(categoryData)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value) // Sort by value descending

    // If no data from reports, use sample data
    if (chartData.length === 0) {
      setData([
        { name: "Labor", value: 25000 },
        { name: "Parts & Materials", value: 12000 },
        { name: "Marketing", value: 8000 },
        { name: "Office & Admin", value: 4000 },
        { name: "Utilities", value: 3000 },
      ])
    } else {
      setData(chartData)
    }
  }, [dateRange, filters])

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [formatCurrency(value as number), "Expenses"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
