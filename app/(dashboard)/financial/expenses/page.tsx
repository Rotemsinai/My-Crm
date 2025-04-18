"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FinancialExpensesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Expense Analysis</h2>
        <p className="text-muted-foreground">Analyze your expenses and spending patterns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Analysis</CardTitle>
          <CardDescription>View and analyze your expense data</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Expense analysis content will be implemented soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
