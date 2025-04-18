"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

const data = [
  { name: "Discovery", value: 5, count: 5 },
  { name: "Proposal", value: 12, count: 12 },
  { name: "Negotiation", value: 8, count: 8 },
  { name: "Closed Won", value: 15, count: 15 },
  { name: "Closed Lost", value: 7, count: 7 },
]

const COLORS = ["#0088FE", "#8884d8", "#FFBB28", "#00C49F", "#FF8042"]

export function SalesPipelineChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, props: any) => {
              return [`${props.payload.count} deals`, name]
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
