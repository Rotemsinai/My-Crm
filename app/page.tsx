"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Menu, X, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TasksList } from "@/components/tasks-list"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { TaskSummary } from "@/components/task-summary"
import { TopCustomersChart } from "@/components/top-customers-chart"
import { SalesPipelineChart } from "@/components/sales-pipeline-chart"
import { UpcomingMeetings } from "@/components/upcoming-meetings"
import { Overview } from "@/components/overview"
import { RecentActivity } from "@/components/recent-activity"
import { Sidebar } from "@/components/sidebar"
import { MarketingLeads } from "@/components/marketing-leads"
import { MarketingAnalytics } from "@/components/marketing-analytics"
import { MarketingFilters } from "@/components/marketing-filters"
import { DateRangePicker } from "@/components/date-range-picker"
import { addDays } from "date-fns"
import { ReportUploadDialog } from "@/components/report-upload-dialog"
import { EmployeePerformanceChart } from "@/components/employee-performance-chart"
import { PlatformEffectivenessChart } from "@/components/platform-effectiveness-chart"
import { JobStatusChart } from "@/components/job-status-chart"
import { PaymentMethodsChart } from "@/components/payment-methods-chart"
import { TechnicianTable } from "@/components/technician-table"
import { FinancialSummary } from "@/components/financial-summary"
import { ExpensesByCategoryChart } from "@/components/expenses-by-category-chart"
import { IncomeExpenseChart } from "@/components/income-expense-chart"
import { VendorExpensesChart } from "@/components/vendor-expenses-chart"
import { ProfitMarginChart } from "@/components/profit-margin-chart"
import { MonthlyTrendsChart } from "@/components/monthly-trends-chart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function HomePage() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  })
  const [activeFilters, setActiveFilters] = useState({
    reports: ["all"],
    platforms: ["all"],
    metrics: ["leads", "income", "expenses", "roi", "conversion"],
    campaigns: ["all"],
    leadStatus: ["all"],
    regions: ["all"],
    categories: ["all"],
    vendors: ["all"],
  })
  const [isAddReportOpen, setIsAddReportOpen] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [hasReports, setHasReports] = useState(false)

  // Load reports from localStorage
  useEffect(() => {
    const storedReports = JSON.parse(localStorage.getItem("reports") || "[]")
    setReports(storedReports)
    setHasReports(storedReports.length > 0)
  }, [isAddReportOpen]) // Reload when dialog closes

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - always in the DOM, visibility controlled by width */}
      <div
        style={{ width: sidebarOpen ? "16rem" : "0" }}
        className="h-screen overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="h-full w-64 bg-background border-r">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-16 border-b flex items-center justify-between px-4 bg-background">
          {/* Hamburger menu - always visible */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4">
          <div className="flex flex-col">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => setIsAddTaskOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                  <Button onClick={() => setIsAddReportOpen(true)} variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Add Report
                  </Button>
                </div>
              </div>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  <TabsTrigger value="employees">Employees</TabsTrigger>
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

                {/* Financial Tab */}
                <TabsContent value="financial" className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    <Button variant="outline" className="md:w-auto">
                      Export Data
                    </Button>
                  </div>

                  <MarketingFilters activeFilters={activeFilters} setActiveFilters={setActiveFilters} />

                  {!hasReports && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No financial reports found. Please upload a financial report to see data analysis.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <FinancialSummary dateRange={dateRange} filters={activeFilters} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                      <CardHeader>
                        <CardTitle>Income vs Expenses</CardTitle>
                        <CardDescription>Monthly comparison</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <IncomeExpenseChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                    <Card className="col-span-3">
                      <CardHeader>
                        <CardTitle>Expenses by Category</CardTitle>
                        <CardDescription>Distribution of expenses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ExpensesByCategoryChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Profit Margin Trend</CardTitle>
                        <CardDescription>Monthly profit margin</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ProfitMarginChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Top Vendors by Expense</CardTitle>
                        <CardDescription>Highest expense vendors</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <VendorExpensesChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Financial Trends</CardTitle>
                      <CardDescription>Income, expenses, and profit over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MonthlyTrendsChart dateRange={dateRange} filters={activeFilters} />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="marketing" className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    <Button variant="outline" className="md:w-auto">
                      Export Data
                    </Button>
                  </div>

                  <MarketingFilters activeFilters={activeFilters} setActiveFilters={setActiveFilters} />

                  {!hasReports && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No marketing reports found. Please upload a report to see data analysis.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <MarketingLeads dateRange={dateRange} filters={activeFilters} />
                  </div>

                  <MarketingAnalytics dateRange={dateRange} filters={activeFilters} />

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Platform ROI Comparison</CardTitle>
                        <CardDescription>Return on investment by platform</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        {/* ROI Comparison Chart */}
                        <div className="flex h-full items-center justify-center">
                          <div className="w-full h-full" id="roi-chart"></div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Lead Quality Score</CardTitle>
                        <CardDescription>Average quality score by platform</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        {/* Lead Quality Chart */}
                        <div className="flex h-full items-center justify-center">
                          <div className="w-full h-full" id="quality-chart"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="employees" className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <DateRangePicker date={dateRange} onDateChange={setDateRange} />
                    <Button variant="outline" className="md:w-auto">
                      Export Data
                    </Button>
                  </div>

                  <MarketingFilters activeFilters={activeFilters} setActiveFilters={setActiveFilters} />

                  {!hasReports && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No employee reports found. Please upload an employee/technician report to see data analysis.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">120</div>
                        <p className="text-xs text-muted-foreground">+8% from last month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Job Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">$800</div>
                        <p className="text-xs text-muted-foreground">+5% from last month</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">68.5%</div>
                        <p className="text-xs text-muted-foreground">+2.1% from previous period</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">8</div>
                        <p className="text-xs text-muted-foreground">3 full-time, 5 contractors</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                      <CardHeader>
                        <CardTitle>Employee Performance</CardTitle>
                        <CardDescription>Job completion and revenue by technician</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <EmployeePerformanceChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                    <Card className="col-span-3">
                      <CardHeader>
                        <CardTitle>Platform Effectiveness</CardTitle>
                        <CardDescription>Conversion rates by platform</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PlatformEffectivenessChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Job Status Distribution</CardTitle>
                        <CardDescription>By completion status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <JobStatusChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>By frequency and amount</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <PaymentMethodsChart dateRange={dateRange} filters={activeFilters} />
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Technician Details</CardTitle>
                      <CardDescription>Performance metrics for each technician</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TechnicianTable dateRange={dateRange} filters={activeFilters} />
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
              <ReportUploadDialog open={isAddReportOpen} onOpenChange={setIsAddReportOpen} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
