"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PaymentMethodsChartProps {
  dateRange: {
    from: Date
    to: Date
  }
  filters: {
    reports: string[]
    platforms: string[]
    metrics: string[]
    campaigns: string[]
    leadStatus: string[]
    regions: string[]
  }
}

export function PaymentMethodsChart({ dateRange, filters }: PaymentMethodsChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // Load data from reports in localStorage
    const reports = JSON.parse(localStorage.getItem("reports") || "[]")

    // Filter reports by selected reports and type
    const filteredReports = reports.filter((report: any) => {
      // Include if "all" is selected or if this report is specifically selected
      const isReportSelected = filters.reports.includes("all") || filters.reports.includes(report.id)
      // Only include employee reports
      const isEmployeeReport = report.type === "employee"
      return isReportSelected && isEmployeeReport
    })

    // Extract payment method data from reports
    const paymentData: Record<string, { count: number; amount: number }> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.paymentMethods) {
        report.data.paymentMethods.forEach((method: any) => {
          if (!paymentData[method.method]) {
            paymentData[method.method] = { count: 0, amount: 0 }
          }

          paymentData[method.method].count += method.count
          paymentData[method.method].amount += method.amount
        })
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(paymentData).map(([name, data]) => ({
      name,
      count: data.count,
      amount: data.amount,
      // Calculate average transaction value
      avgValue: data.count > 0 ? Math.round(data.amount / data.count) : 0,
    }))

    // If no data from reports, use sample data
    if (chartData.length === 0) {
      setData([
        { name: "Credit Card", count: 78, amount: 62400, avgValue: 800 },
        { name: "Cash", count: 22, amount: 17600, avgValue: 800 },
        { name: "Check", count: 12, amount: 9600, avgValue: 800 },
        { name: "Online", count: 8, amount: 6400, avgValue: 800 },
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
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip
          formatter={(value, name) => {
            if (name === "amount") return [formatCurrency(value as number), "Total Amount"]
            if (name === "count") return [value, "Number of Transactions"]
            if (name === "avgValue") return [formatCurrency(value as number), "Avg. Transaction Value"]
            return [value, name]
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Transactions" />
        <Bar yAxisId="right" dataKey="amount" fill="#82ca9d" name="Amount" />
      </BarChart>
    </ResponsiveContainer>
  )
}
