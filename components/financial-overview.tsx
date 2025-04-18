"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

interface FinancialOverviewProps {
  reportId: string | null
  reports: any[]
}

export function FinancialOverview({ reportId, reports }: FinancialOverviewProps) {
  // Get the selected report
  const selectedReport = reportId ? reports.find((r) => r.id === reportId) : null

  // Use the monthly data from the report, or fallback to empty array
  const data = selectedReport?.monthlyData || []

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#0056b3" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="Expenses" fill="#d32f2f" radius={[4, 4, 0, 0]} />
        <Bar dataKey="profit" name="Profit" fill="#2e7d32" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
