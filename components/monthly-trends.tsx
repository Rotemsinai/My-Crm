"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MonthlyTrendsProps {
  reportId: string | null
  reports: any[]
}

export function MonthlyTrends({ reportId, reports }: MonthlyTrendsProps) {
  // Get the selected report
  const selectedReport = reportId ? reports.find((r) => r.id === reportId) : null

  // Use the monthly data from the report, or fallback to empty array
  const data = selectedReport?.monthlyData || []

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
          <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#0056b3" name="Income" strokeWidth={2} />
          <Line type="monotone" dataKey="expenses" stroke="#d32f2f" name="Expenses" strokeWidth={2} />
          <Line type="monotone" dataKey="profit" stroke="#2e7d32" name="Profit" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
