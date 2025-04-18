"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Acme Corp",
    value: 45000,
  },
  {
    name: "Globex Inc",
    value: 72500,
  },
  {
    name: "Stark Industries",
    value: 120000,
  },
  {
    name: "Umbrella Corp",
    value: 95000,
  },
  {
    name: "Wayne Enterprises",
    value: 68000,
  },
]

export function TopCustomersChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
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
          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
          <Bar dataKey="value" fill="#0056b3" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
