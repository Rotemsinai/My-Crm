"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ProfitMarginChartProps {
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

export function ProfitMarginChart({ dateRange, filters }: ProfitMarginChartProps) {
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

    // Extract monthly data from reports
    const monthlyData: Record<string, { income: number; expenses: number; margin: number }> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.monthlyData) {
        report.data.monthlyData.forEach((month: any) => {
          if (!monthlyData[month.month]) {
            monthlyData[month.month] = { income: 0, expenses: 0, margin: 0 }
          }
          monthlyData[month.month].income += month.income
          monthlyData[month.month].expenses += month.expenses
          // Calculate profit margin
          const profit = monthlyData[month.month].income - monthlyData[month.month].expenses
          monthlyData[month.month].margin =
            monthlyData[month.month].income > 0 ? (profit / monthlyData[month.month].income) * 100 : 0
        })
      }
    })

    // Convert to array format for chart
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const chartData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        margin: Number.parseFloat(data.margin.toFixed(1)),
      }))
      .sort((a, b) => {
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
      })

    // If no data from reports, use sample data
    if (chartData.length === 0) {
      setData([
        { month: "Jan", margin: 37.5 },
        { month: "Feb", margin: 39.3 },
        { month: "Mar", margin: 38.5 },
        { month: "Apr", margin: 38.8 },
        { month: "May", margin: 38.6 },
        { month: "Jun", margin: 40.0 },
      ])
    } else {
      setData(chartData)
    }
  }, [dateRange, filters])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis domain={[0, "dataMax + 10"]} />
        <Tooltip formatter={(value) => [`${value}%`, "Profit Margin"]} />
        <Legend />
        <Line
          type="monotone"
          dataKey="margin"
          name="Profit Margin"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
