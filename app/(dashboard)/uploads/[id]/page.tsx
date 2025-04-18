"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, LineChart, Download, Share, FileSpreadsheet, ArrowLeft } from "lucide-react"
import { format } from "date-fns"

// Mock data for financial analysis - this would be replaced with real data from uploaded Excel files
const mockFinancialData = {
  reportName: "April 1-15 P&L",
  uploadDate: new Date(),
  totalIncome: 45678.9,
  totalExpenses: 32456.78,
  netIncome: 13222.12,
  previousPeriodNetIncome: 12100.45,
  categories: [
    { name: "Sales", amount: 42500.0, previousAmount: 40200.0 },
    { name: "Service Revenue", amount: 3178.9, previousAmount: 2800.0 },
    { name: "Cost of Goods Sold", amount: 18500.45, previousAmount: 17800.0 },
    { name: "Rent", amount: 3500.0, previousAmount: 3500.0 },
    { name: "Utilities", amount: 1245.67, previousAmount: 1180.45 },
    { name: "Salaries", amount: 7500.0, previousAmount: 7500.0 },
    { name: "Marketing", amount: 1200.0, previousAmount: 950.0 },
    { name: "Office Supplies", amount: 510.66, previousAmount: 480.33 },
  ],
  monthlyData: [
    { month: "Jan", income: 41200, expenses: 30100 },
    { month: "Feb", income: 42500, expenses: 31200 },
    { month: "Mar", income: 44100, expenses: 32000 },
    { month: "Apr", income: 45678, expenses: 32456 },
  ],
}

export default function UploadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [data, setData] = useState(mockFinancialData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const calculatePercentChange = (current: number, previous: number) => {
    if (previous === 0) return 100
    return ((current - previous) / previous) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mrs-blue mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Analyzing financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Uploads
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{data.reportName}</h2>
          <p className="text-muted-foreground">Uploaded on {format(data.uploadDate, "PPP")} • Financial Analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button className="bg-mrs-blue hover:bg-mrs-darkBlue">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            View Raw Data
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentChange(data.totalIncome, data.previousPeriodNetIncome) > 0 ? "+" : ""}
              {calculatePercentChange(data.totalIncome, data.previousPeriodNetIncome).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentChange(data.totalExpenses, data.previousPeriodNetIncome) > 0 ? "+" : ""}
              {calculatePercentChange(data.totalExpenses, data.previousPeriodNetIncome).toFixed(1)}% from previous
              period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.netIncome)}</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentChange(data.netIncome, data.previousPeriodNetIncome) > 0 ? "+" : ""}
              {calculatePercentChange(data.netIncome, data.previousPeriodNetIncome).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{((data.netIncome / data.totalIncome) * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {calculatePercentChange(
                data.netIncome / data.totalIncome,
                data.previousPeriodNetIncome / data.totalIncome,
              ) > 0
                ? "+"
                : ""}
              {calculatePercentChange(
                data.netIncome / data.totalIncome,
                data.previousPeriodNetIncome / data.totalIncome,
              ).toFixed(1)}
              % from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
                <CardDescription>Monthly comparison</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <BarChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Income vs Expenses Chart</span>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Expense Categories Chart</span>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>Income and expense trends over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <LineChart className="h-16 w-16 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Financial Trends Chart</span>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categories
                  .filter((cat) => cat.name.includes("Sales") || cat.name.includes("Revenue"))
                  .map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {calculatePercentChange(category.amount, category.previousAmount) > 0 ? "+" : ""}
                          {calculatePercentChange(category.amount, category.previousAmount).toFixed(1)}% from previous
                          period
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(category.amount)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.categories
                  .filter((cat) => !cat.name.includes("Sales") && !cat.name.includes("Revenue"))
                  .map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {calculatePercentChange(category.amount, category.previousAmount) > 0 ? "+" : ""}
                          {calculatePercentChange(category.amount, category.previousAmount).toFixed(1)}% from previous
                          period
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(category.amount)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Income and expenses over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <LineChart className="h-16 w-16 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Monthly Trends Chart</span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
