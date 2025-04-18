import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceOverview } from "@/components/performance-overview"
import { CommissionSummary } from "@/components/commission-summary"
import { TopPerformers } from "@/components/top-performers"
import { RecentCommissions } from "@/components/recent-commissions"

export const metadata: Metadata = {
  title: "Performance Pay Dashboard",
  description: "Overview of commission earnings and performance metrics",
}

export default function PerformancePayDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Performance Pay Dashboard</h1>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="periods">Pay Periods</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,546.00</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">+2 new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Earner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">John Smith</div>
                <p className="text-xs text-muted-foreground">$3,245 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$5,231.00</div>
                <p className="text-xs text-muted-foreground">For current period</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <PerformanceOverview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Top earning team members this month</CardDescription>
              </CardHeader>
              <CardContent>
                <TopPerformers />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Commissions</CardTitle>
                <CardDescription>Latest commission earnings across all team members</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentCommissions />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Commission Summary</CardTitle>
                <CardDescription>Breakdown by commission rule type</CardDescription>
              </CardHeader>
              <CardContent>
                <CommissionSummary />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Compare performance across team members</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Team performance content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="periods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pay Periods</CardTitle>
              <CardDescription>Manage commission pay periods</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Pay periods content will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
