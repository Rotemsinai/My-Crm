import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { CommissionReportTable } from "@/components/commission-report-table"

export const metadata: Metadata = {
  title: "Commission Reports",
  description: "View and export performance pay reports",
}

export default function CommissionReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Commission Reports</h1>
        <DateRangePicker />
      </div>
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Commissions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="by-user">By User</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Commissions</CardTitle>
              <CardDescription>View all commission earnings across your team</CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionReportTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Commissions</CardTitle>
              <CardDescription>View commissions that have not yet been paid</CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionReportTable filterStatus="pending" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="paid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paid Commissions</CardTitle>
              <CardDescription>View commissions that have been paid out</CardDescription>
            </CardHeader>
            <CardContent>
              <CommissionReportTable filterStatus="paid" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="by-user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commissions By User</CardTitle>
              <CardDescription>View commission breakdowns by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User selection and filtered report will go here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
