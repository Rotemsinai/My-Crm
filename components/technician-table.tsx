"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TechnicianTableProps {
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

export function TechnicianTable({ dateRange, filters }: TechnicianTableProps) {
  const [data, setData] = useState<any[]>([])
  const [sortColumn, setSortColumn] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

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
    const employeeData: Record<string, any> = {}

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.employees) {
        report.data.employees.forEach((employee: any) => {
          if (!employeeData[employee.name]) {
            employeeData[employee.name] = {
              name: employee.name,
              jobs: 0,
              revenue: 0,
              techParts: 0,
              companyParts: 0,
              conversionRate: 0,
              platforms: {},
              totalLeads: 0, // For calculating overall conversion rate
            }
          }

          // Update employee metrics
          employeeData[employee.name].jobs += employee.jobs
          employeeData[employee.name].revenue += employee.revenue
          employeeData[employee.name].techParts += employee.techParts || 0
          employeeData[employee.name].companyParts += employee.companyParts || 0

          // Weighted average for conversion rate
          const currentTotalLeads = employeeData[employee.name].totalLeads
          const newLeads = employee.jobs / (employee.conversionRate / 100) // Estimate total leads from conversion rate
          employeeData[employee.name].totalLeads += newLeads

          // Update conversion rate as weighted average
          if (employeeData[employee.name].totalLeads > 0) {
            employeeData[employee.name].conversionRate =
              (employeeData[employee.name].jobs / employeeData[employee.name].totalLeads) * 100
          }

          // Process platform data
          if (employee.platforms) {
            employee.platforms.forEach((platform: any) => {
              // Filter platforms if needed
              if (
                filters.platforms.includes("all") ||
                filters.platforms.some((p) => platform.name.toLowerCase().includes(p))
              ) {
                if (!employeeData[employee.name].platforms[platform.name]) {
                  employeeData[employee.name].platforms[platform.name] = {
                    jobs: 0,
                    revenue: 0,
                  }
                }

                employeeData[employee.name].platforms[platform.name].jobs += platform.jobs
                employeeData[employee.name].platforms[platform.name].revenue += platform.revenue
              }
            })
          }
        })
      }
    })

    // Convert to array and calculate derived metrics
    const tableData = Object.values(employeeData).map((employee: any) => {
      // Calculate average job value
      const avgJobValue = employee.jobs > 0 ? employee.revenue / employee.jobs : 0

      // Calculate parts percentage
      const totalParts = employee.techParts + employee.companyParts
      const partsPercentage = employee.revenue > 0 ? (totalParts / employee.revenue) * 100 : 0

      // Find top platform
      let topPlatform = { name: "None", jobs: 0, revenue: 0 }
      Object.entries(employee.platforms).forEach(([name, data]: [string, any]) => {
        if (data.jobs > topPlatform.jobs) {
          topPlatform = { name, ...data }
        }
      })

      return {
        ...employee,
        avgJobValue,
        partsPercentage,
        topPlatform: topPlatform.name,
        topPlatformJobs: topPlatform.jobs,
        topPlatformRevenue: topPlatform.revenue,
      }
    })

    // If no data from reports, use sample data
    if (tableData.length === 0) {
      setData([
        {
          name: "John Smith",
          jobs: 42,
          revenue: 35700,
          techParts: 4200,
          companyParts: 6300,
          conversionRate: 68,
          avgJobValue: 850,
          partsPercentage: 29.4,
          topPlatform: "Thumbtack",
          topPlatformJobs: 12,
          topPlatformRevenue: 10200,
        },
        {
          name: "Mike Johnson",
          jobs: 38,
          revenue: 30400,
          techParts: 3800,
          companyParts: 5700,
          conversionRate: 72,
          avgJobValue: 800,
          partsPercentage: 31.3,
          topPlatform: "Google",
          topPlatformJobs: 12,
          topPlatformRevenue: 9600,
        },
        {
          name: "Sarah Williams",
          jobs: 40,
          revenue: 29900,
          techParts: 3600,
          companyParts: 5400,
          conversionRate: 65,
          avgJobValue: 747.5,
          partsPercentage: 30.1,
          topPlatform: "Yelp",
          topPlatformJobs: 12,
          topPlatformRevenue: 9000,
        },
      ])
    } else {
      // Sort the data
      const sortedData = [...tableData].sort((a, b) => {
        if (sortColumn === "name") {
          return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        }

        // For numeric columns
        const aValue = a[sortColumn] || 0
        const bValue = b[sortColumn] || 0

        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      })

      setData(sortedData)
    }
  }, [dateRange, filters, sortColumn, sortDirection])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Handle column sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Get sort indicator
  const getSortIndicator = (column: string) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? " ↑" : " ↓"
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
              Technician {getSortIndicator("name")}
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("jobs")}>
              Jobs {getSortIndicator("jobs")}
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("revenue")}>
              Revenue {getSortIndicator("revenue")}
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("avgJobValue")}>
              Avg. Job Value {getSortIndicator("avgJobValue")}
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("conversionRate")}>
              Conversion Rate {getSortIndicator("conversionRate")}
            </TableHead>
            <TableHead className="cursor-pointer text-right" onClick={() => handleSort("partsPercentage")}>
              Parts % {getSortIndicator("partsPercentage")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("topPlatform")}>
              Top Platform {getSortIndicator("topPlatform")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((technician) => (
            <TableRow key={technician.name}>
              <TableCell className="font-medium">{technician.name}</TableCell>
              <TableCell className="text-right">{technician.jobs}</TableCell>
              <TableCell className="text-right">{formatCurrency(technician.revenue)}</TableCell>
              <TableCell className="text-right">{formatCurrency(technician.avgJobValue)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Progress value={technician.conversionRate} className="w-16 h-2" />
                  <span>{technician.conversionRate.toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{technician.partsPercentage.toFixed(1)}%</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  {technician.topPlatform} ({technician.topPlatformJobs} jobs)
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
