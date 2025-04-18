"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIInsights } from "@/components/ai-insights"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { DateRangePicker } from "@/components/date-range-picker"
import { useState } from "react"

export default function InsightsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2023, 0, 1),
    to: new Date(),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Insights</h2>
          <p className="text-muted-foreground">Automated financial analysis and recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated observations about your financial data</CardDescription>
          </CardHeader>
          <CardContent>
            <AIInsights />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Breakdown by percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Top expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>AI-generated recommendations to improve your finances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Reduce Contractor Costs</h3>
                <p className="text-sm text-muted-foreground">
                  Contractor costs are 15% above industry average. Consider negotiating rates or consolidating vendors.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Increase Marketing Efficiency</h3>
                <p className="text-sm text-muted-foreground">
                  Your marketing ROI is below target. Focus on channels with higher conversion rates.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Optimize Cash Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Consider adjusting payment terms to improve cash flow during low-income months.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
