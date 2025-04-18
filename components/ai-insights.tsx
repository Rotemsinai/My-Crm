"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

const insights = [
  {
    text: "March was your most profitable month with $24,500 net profit.",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    text: "Contractor costs were highest in April, accounting for 45% of expenses.",
    icon: AlertCircle,
    color: "text-amber-500",
  },
  {
    text: "Job supplies expenses have decreased by 12% compared to last quarter.",
    icon: TrendingDown,
    color: "text-blue-500",
  },
  {
    text: "Consider reducing equipment costs which are 15% above industry average.",
    icon: Lightbulb,
    color: "text-purple-500",
  },
]

export function AIInsights() {
  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <Card key={index} className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`${insight.color} mt-0.5`}>
                <insight.icon className="h-5 w-5" />
              </div>
              <p className="text-sm">{insight.text}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
