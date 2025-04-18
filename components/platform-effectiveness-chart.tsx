"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface PlatformEffectivenessChartProps {
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

export function PlatformEffectivenessChart({ dateRange, filters }: PlatformEffectivenessChartProps) {
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

    // Extract platform data from reports
    const platformData: Record<string, { jobs: number; revenue: number }> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.employees) {
        report.data.employees.forEach((employee: any) => {
          if (employee.platforms) {
            employee.platforms.forEach((platform: any) => {
              // Filter platforms if needed
              if (
                filters.platforms.includes("all") ||
                filters.platforms.some((p) => platform.name.toLowerCase().includes(p))
              ) {
                if (!platformData[platform.name]) {
                  platformData[platform.name] = { jobs: 0, revenue: 0 }
                }

                platformData[platform.name].jobs += platform.jobs
                platformData[platform.name].revenue += platform.revenue
              }
            })
          }
        })
      }
    })

    // Convert to array format for chart
    const chartData = Object.entries(platformData).map(([name, data]) => ({
      name,
      value: data.jobs,
      revenue: data.revenue,
      // Calculate average job value
      avgValue: data.jobs > 0 ? Math.round(data.revenue / data.jobs) : 0,
    }))

    // If no data from reports, use sample data
    if (chartData.length === 0) {
      setData([
        { name: "Thumbtack", value: 33, revenue: 26400, avgValue: 800 },
        { name: "Yelp", value: 28, revenue: 22400, avgValue: 800 },
        { name: "Networx", value: 25, revenue: 20000, avgValue: 800 },
        { name: "Facebook", value: 21, revenue: 16800, avgValue: 800 },
        { name: "Google", value: 13, revenue: 10400, avgValue: 800 },
      ])
    } else {
      setData(chartData)
    }
  }, [dateRange, filters])

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

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
          <Tooltip
            formatter={(value, name, props) => {
              if (name === "value") return [value, "Jobs"]
              if (props.payload.avgValue) return [formatCurrency(props.payload.avgValue), "Avg. Job Value"]
              if (props.payload.revenue) return [formatCurrency(props.payload.revenue), "Revenue"]
              return [value, name]
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
