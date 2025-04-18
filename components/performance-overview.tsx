"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function PerformanceOverview() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Commission Amount ($)",
        },
      },
    },
  }

  const labels = ["January", "February", "March", "April", "May", "June"]

  const data = {
    labels,
    datasets: [
      {
        label: "Sales Commissions",
        data: [4200, 3800, 5100, 4700, 6200, 5800],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Service Commissions",
        data: [2100, 2400, 2800, 3200, 3600, 4100],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  }

  return (
    <div className="h-[300px]">
      <Bar options={options} data={data} />
    </div>
  )
}
