"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

const data = [
  {
    name: "Jan",
    income: 18000,
    expenses: 14500,
    profit: 3500,
  },
  {
    name: "Feb",
    income: 22000,
    expenses: 16800,
    profit: 5200,
  },
  {
    name: "Mar",
    income: 35000,
    expenses: 10500,
    profit: 24500,
  },
  {
    name: "Apr",
    income: 29000,
    expenses: 18000,
    profit: 11000,
  },
  {
    name: "May",
    income: 32000,
    expenses: 25000,
    profit: 7000,
  },
  {
    name: "Jun",
    income: 38000,
    expenses: 28000,
    profit: 10000,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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
