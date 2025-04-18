"use client"

import { useState } from "react"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CustomerTable } from "@/components/customer-table"
import { DealsTable } from "@/components/deals-table"
import { TasksList } from "@/components/tasks-list"
import { UserNav } from "@/components/user-nav"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Search } from "lucide-react"
import { TaskSummary } from "@/components/task-summary"
import { TopCustomersChart } from "@/components/top-customers-chart"
import { SalesPipelineChart } from "@/components/sales-pipeline-chart"
// Import the UpcomingMeetings component
import { UpcomingMeetings } from "@/components/upcoming-meetings"
import { Overview } from "@/components/overview"
import { RecentActivity } from "@/components/recent-activity"

export default function DashboardPage() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-[200px] pl-8 md:w-[300px] lg:w-[400px]" />
            </div>
            <UserNav />
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsAddTaskOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="deals">Deals</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$432,500</div>
                  <p className="text-xs text-muted-foreground">23 opportunities in pipeline</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.3%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tasks Due</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">5 overdue, 7 due today</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Task Summary</CardTitle>
                  <CardDescription>Overview of your tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskSummary />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Monthly income and expenses</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>By revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopCustomersChart />
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Sales Pipeline</CardTitle>
                  <CardDescription>By stage</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesPipelineChart />
                </CardContent>
              </Card>
            </div>
            {/* Add the UpcomingMeetings component to the overview TabsContent */}
            {/* Add this after the grid with TopCustomersChart and SalesPipelineChart */}
            <div className="grid gap-4 md:grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Meetings</CardTitle>
                  <CardDescription>Your scheduled meetings</CardDescription>
                </CardHeader>
                <CardContent>
                  <UpcomingMeetings />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>Manage your customer relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="deals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deals Pipeline</CardTitle>
                <CardDescription>Track your sales opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <DealsTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Manage your follow-ups and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <TasksList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
      </div>
    </div>
  )
}
