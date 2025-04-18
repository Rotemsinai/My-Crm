"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface JobStatusChartProps {
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

export function JobStatusChart({ dateRange, filters }: JobStatusChartProps) {
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

    // Extract job status data from reports
    const statusData: Record<string, number> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.jobStatuses) {
        report.data.jobStatuses.forEach((status: any) => {
          if (!statusData[status.status]) {
            statusData[status.status] = 0
          }

          statusData[status.status] += status.count
        })
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(statusData).map(([name, value]) => ({
      name,
      value,
    }))

    // If no data from reports, use sample data
    if (chartData.length === 0) {
      setData([
        { name: "Completed", value: 98 },
        { name: "In Progress", value: 12 },
        { name: "Cancelled", value: 6 },
        { name: "Scheduled", value: 4 },
      ])
    } else {
      setData(chartData)
    }
  }, [dateRange, filters])

  // Colors for the pie chart
  const COLORS = ["#4CAF50", "#2196F3", "#F44336", "#FFC107", "#9C27B0"]

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
          <Tooltip formatter={(value) => [value, "Jobs"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
