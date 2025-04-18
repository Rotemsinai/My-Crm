"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ExpensesByCategoryProps {
  reportId: string | null
  reports: any[]
  categoryFilter?: string[]
}

export function ExpensesByCategory({ reportId, reports, categoryFilter = [] }: ExpensesByCategoryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Get the selected report
  const selectedReport = reportId ? reports.find((r) => r.id === reportId) : null

  // Get the category breakdown from the report, or fallback to empty array
  let categories = selectedReport?.categoryBreakdown || []

  // Apply category filter if provided
  if (categoryFilter.length > 0) {
    categories = categories.filter((category: any) => categoryFilter.includes(category.name))
  }

  // Sort categories by amount (descending)
  categories = [...categories].sort((a: any, b: any) => b.amount - a.amount)

  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"]

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-4">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="name"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {categories.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={activeIndex === index ? "#fff" : "none"}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Amount"]}
              labelFormatter={(name) => `Category: ${name}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ScrollArea className="h-[150px]">
        <div className="space-y-4">
          {categories.map((category: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{category.name}</span>
                <span className="font-medium">{formatCurrency(category.amount)}</span>
              </div>
              <Progress
                value={category.percentage}
                className="h-2"
                indicatorClassName={`bg-[${COLORS[index % COLORS.length]}]`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{category.percentage}% of total</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
