"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react"

interface FinancialSummaryProps {
  dateRange: {
    from: Date
    to: Date
  }
  filters: {
    reports: string[]
    categories?: string[]
    vendors?: string[]
    metrics?: string[]
  }
}

export function FinancialSummary({ dateRange, filters }: FinancialSummaryProps) {
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    profitMargin: 0,
    incomeChange: 0,
    expenseChange: 0,
    netIncomeChange: 0,
    marginChange: 0,
  })

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

    // Extract financial summary data from reports
    let totalIncome = 0
    let totalExpenses = 0
    let previousIncome = 0
    let previousExpenses = 0

    filteredReports.forEach((report: any) => {
      if (report.data && report.data.summary) {
        totalIncome += report.data.summary.totalIncome || 0
        totalExpenses += report.data.summary.totalExpenses || 0
      }

      // For change calculation, assume previous period is half of current
      // In a real app, you would compare with actual previous period data
      previousIncome = totalIncome * 0.9
      previousExpenses = totalExpenses * 0.95
    })

    // Calculate derived metrics
    const netIncome = totalIncome - totalExpenses
    const previousNetIncome = previousIncome - previousExpenses
    const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0
    const previousMargin = previousIncome > 0 ? (previousNetIncome / previousIncome) * 100 : 0

    // Calculate changes
    const incomeChange = previousIncome > 0 ? ((totalIncome - previousIncome) / previousIncome) * 100 : 0
    const expenseChange = previousExpenses > 0 ? ((totalExpenses - previousExpenses) / previousExpenses) * 100 : 0
    const netIncomeChange = previousNetIncome > 0 ? ((netIncome - previousNetIncome) / previousNetIncome) * 100 : 0
    const marginChange = previousMargin > 0 ? profitMargin - previousMargin : 0

    // If no data from reports, use sample data
    if (filteredReports.length === 0) {
      setSummaryData({
        totalIncome: 85000,
        totalExpenses: 52000,
        netIncome: 33000,
        profitMargin: 38.8,
        incomeChange: 12.5,
        expenseChange: 8.2,
        netIncomeChange: 15.3,
        marginChange: 2.1,
      })
    } else {
      setSummaryData({
        totalIncome,
        totalExpenses,
        netIncome,
        profitMargin,
        incomeChange,
        expenseChange,
        netIncomeChange,
        marginChange,
      })
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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summaryData.totalIncome)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {summaryData.incomeChange >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={summaryData.incomeChange >= 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(summaryData.incomeChange).toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summaryData.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {summaryData.expenseChange <= 0 ? (
              <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={summaryData.expenseChange <= 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(summaryData.expenseChange).toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summaryData.netIncome)}</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {summaryData.netIncomeChange >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={summaryData.netIncomeChange >= 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(summaryData.netIncomeChange).toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summaryData.profitMargin.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground flex items-center">
            {summaryData.marginChange >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
            )}
            <span className={summaryData.marginChange >= 0 ? "text-green-500" : "text-red-500"}>
              {Math.abs(summaryData.marginChange).toFixed(1)}%
            </span>{" "}
            from previous period
          </p>
        </CardContent>
      </Card>
    </>
  )
}
