"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyTrendsChartProps {
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

export function MonthlyTrendsChart({ dateRange, filters }: MonthlyTrendsChartProps) {
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
    const monthlyData: Record<string, { income: number; expenses: number; profit: number }> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.monthlyData) {
        report.data.monthlyData.forEach((month: any) => {
          if (!monthlyData[month.month]) {
            monthlyData[month.month] = { income: 0, expenses: 0, profit: 0 }
          }
          monthlyData[month.month].income += month.income
          monthlyData[month.month].expenses += month.expenses
          monthlyData[month.month].profit = monthlyData[month.month].income - monthlyData[month.month].expenses
        })
      }
    })

    // Convert to array format for chart
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const chartData = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        profit: data.profit,
      }))
      .sort((a, b) => {
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
      })

    // If no data from reports, use sample data
    if (chartData.length === 0) {
      setData([
        { month: "Jan", income: 12000, expenses: 7500, profit: 4500 },
        { month: "Feb", income: 13500, expenses: 8200, profit: 5300 },
        { month: "Mar", income: 14800, expenses: 9100, profit: 5700 },
        { month: "Apr", income: 15200, expenses: 9300, profit: 5900 },
        { month: "May", income: 14500, expenses: 8900, profit: 5600 },
        { month: "Jun", income: 15000, expenses: 9000, profit: 6000 },
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
    <ResponsiveContainer width="100%" height={400}>
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
        <YAxis />
        <Tooltip formatter={(value) => [formatCurrency(value as number), ""]} />
        <Legend />
        <Line type="monotone" dataKey="income" name="Income" stroke="#4CAF50" strokeWidth={2} />
        <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#F44336" strokeWidth={2} />
        <Line type="monotone" dataKey="profit" name="Profit" stroke="#2196F3" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
