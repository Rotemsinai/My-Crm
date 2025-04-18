"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface EmployeePerformanceChartProps {
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

export function EmployeePerformanceChart({ dateRange, filters }: EmployeePerformanceChartProps) {
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

    // Extract employee data from reports
    let employeeData: any[] = []

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.employees) {
        report.data.employees.forEach((employee: any) => {
          // Check if employee already exists in our data
          const existingEmployee = employeeData.find((e) => e.name === employee.name)

          if (existingEmployee) {
            // Update existing employee data
            existingEmployee.jobs += employee.jobs
            existingEmployee.revenue += employee.revenue
          } else {
            // Add new employee
            employeeData.push({
              name: employee.name,
              jobs: employee.jobs,
              revenue: employee.revenue,
              conversionRate: employee.conversionRate,
            })
          }
        })
      }
    })

    // If no data from reports, use sample data
    if (employeeData.length === 0) {
      employeeData = [
        { name: "John Smith", jobs: 42, revenue: 35700, conversionRate: 68 },
        { name: "Mike Johnson", jobs: 38, revenue: 30400, conversionRate: 72 },
        { name: "Sarah Williams", jobs: 40, revenue: 29900, conversionRate: 65 },
        { name: "David Brown", jobs: 35, revenue: 28000, conversionRate: 70 },
        { name: "Lisa Garcia", jobs: 32, revenue: 25600, conversionRate: 64 },
      ]
    }

    setData(employeeData)
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
    <ResponsiveContainer width="100%" height={350}>
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
            if (name === "revenue") return [formatCurrency(value as number), "Revenue"]
            if (name === "jobs") return [value, "Jobs"]
            if (name === "conversionRate") return [`${value}%`, "Conversion Rate"]
            return [value, name]
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="jobs" fill="#8884d8" name="Jobs" />
        <Bar yAxisId="left" dataKey="conversionRate" fill="#ffc658" name="Conversion Rate (%)" />
        <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  )
}
