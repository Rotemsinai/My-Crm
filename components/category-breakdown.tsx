"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Contractor Costs",
    value: 85000,
  },
  {
    name: "Job Supplies",
    value: 45000,
  },
  {
    name: "Equipment",
    value: 28000,
  },
  {
    name: "Office Expenses",
    value: 15000,
  },
  {
    name: "Marketing",
    value: 12000,
  },
  {
    name: "Insurance",
    value: 8000,
  },
]

export function CategoryBreakdown() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 70,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={(value) => `$${value / 1000}k`} />
        <YAxis type="category" dataKey="name" />
        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="value" name="Amount" fill="#0056b3" />
      </BarChart>
    </ResponsiveContainer>
  )
}
