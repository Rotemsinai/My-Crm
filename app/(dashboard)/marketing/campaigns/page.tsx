"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function MarketingCampaignsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Marketing Campaigns</h2>
        <p className="text-muted-foreground">Manage and analyze your marketing campaigns</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Campaigns</CardTitle>
          <CardDescription>View and manage your marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Marketing campaigns content will be implemented soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
