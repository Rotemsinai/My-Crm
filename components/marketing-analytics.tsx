"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface MarketingAnalyticsProps {
  dateRange: {
    from: Date
    to: Date
  }
  filters: {
    platforms: string[]
    metrics: string[]
    campaigns: string[]
    leadStatus: string[]
    regions: string[]
    reports: string[]
  }
}

export function MarketingAnalytics({ dateRange, filters }: MarketingAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("leads")

  // Generate data based on reports and filters
  const generateData = () => {
    // Load data from reports in localStorage
    const reports = JSON.parse(localStorage.getItem("reports") || "[]")

    // Filter reports by selected reports and type
    const filteredReports = reports.filter((report: any) => {
      // Include if "all" is selected or if this report is specifically selected
      const isReportSelected = filters.reports.includes("all") || filters.reports.includes(report.id)
      // Only include financial reports
      const isFinancialReport = report.type === "financial"
      return isReportSelected && isFinancialReport
    })

    // If we have reports, extract platform data
    if (filteredReports.length > 0) {
      // Extract platform data from reports
      const platformData: Record<string, any> = {}

      filteredReports.forEach((report: any) => {
        if (report.data && report.data.platforms) {
          report.data.platforms.forEach((platform: any) => {
            // Filter platforms if needed
            if (
              filters.platforms.includes("all") ||
              filters.platforms.some((p) => platform.name.toLowerCase().includes(p))
            ) {
              if (!platformData[platform.name]) {
                platformData[platform.name] = {
                  leads: 0,
                  revenue: 0,
                  expenses: 0,
                  monthlyData: {},
                }
              }

              platformData[platform.name].leads += platform.leads || 0
              platformData[platform.name].revenue += platform.revenue || 0

              // Estimate expenses (in a real app, this would come from the report)
              const estimatedExpenses = platform.revenue * 0.3
              platformData[platform.name].expenses += platform.expenses || estimatedExpenses
            }
          })
        }

        // Process monthly data if available
        if (report.data && report.data.monthlyData) {
          report.data.monthlyData.forEach((monthData: any) => {
            const month = monthData.month

            // For each platform, add monthly data
            Object.keys(platformData).forEach((platformName) => {
              if (!platformData[platformName].monthlyData[month]) {
                platformData[platformName].monthlyData[month] = {
                  income: 0,
                  expenses: 0,
                }
              }

              // Distribute monthly data proportionally across platforms
              // This is a simplification - in a real app, you'd have platform-specific monthly data
              const platformShare =
                platformData[platformName].revenue /
                Object.values(platformData).reduce((sum: number, p: any) => sum + p.revenue, 0)

              platformData[platformName].monthlyData[month].income += monthData.income * platformShare
              platformData[platformName].monthlyData[month].expenses += monthData.expenses * platformShare
            })
          })
        }
      })

      // Convert to the format needed for charts
      const platforms = Object.keys(platformData)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      // Generate leads data
      const leadsData = platforms.map((platform) => ({
        name: platform,
        value: platformData[platform].leads,
        monthlyData: months.map((month) => ({
          month,
          value: platformData[platform].monthlyData[month]?.leads || Math.round(platformData[platform].leads / 6), // Distribute evenly if no monthly data
        })),
      }))

      // Generate income data
      const incomeData = platforms.map((platform) => ({
        name: platform,
        value: platformData[platform].revenue,
        monthlyData: months.map((month) => ({
          month,
          value: platformData[platform].monthlyData[month]?.income || Math.round(platformData[platform].revenue / 6), // Distribute evenly if no monthly data
        })),
      }))

      // Generate expenses data
      const expensesData = platforms.map((platform) => ({
        name: platform,
        value: platformData[platform].expenses,
        monthlyData: months.map((month) => ({
          month,
          value: platformData[platform].monthlyData[month]?.expenses || Math.round(platformData[platform].expenses / 6), // Distribute evenly if no monthly data
        })),
      }))

      // Generate ROI data
      const roiData = platforms.map((platform) => {
        const income = platformData[platform].revenue
        const expenses = platformData[platform].expenses
        const roi = expenses > 0 ? income / expenses : 0

        return {
          name: platform,
          value: Number.parseFloat(roi.toFixed(2)),
          monthlyData: months.map((month, index) => {
            const monthlyIncome =
              platformData[platform].monthlyData[month]?.income ||
              incomeData.find((p) => p.name === platform)?.monthlyData[index].value ||
              0
            const monthlyExpenses =
              platformData[platform].monthlyData[month]?.expenses ||
              expensesData.find((p) => p.name === platform)?.monthlyData[index].value ||
              1
            return {
              month,
              value: Number.parseFloat((monthlyIncome / monthlyExpenses).toFixed(2)),
            }
          }),
        }
      })

      // Generate conversion rate data (estimated)
      const conversionData = platforms.map((platform) => {
        // Base conversion rate on platform
        let baseRate
        if (platform.toLowerCase().includes("thumbtack")) baseRate = 18
        else if (platform.toLowerCase().includes("yelp")) baseRate = 15
        else if (platform.toLowerCase().includes("networx")) baseRate = 12
        else if (platform.toLowerCase().includes("facebook")) baseRate = 22
        else if (platform.toLowerCase().includes("google")) baseRate = 14
        else baseRate = 15

        return {
          name: platform,
          value: baseRate,
          monthlyData: months.map((month) => ({
            month,
            value: Math.round(baseRate * (0.8 + Math.random() * 0.4)),
          })),
        }
      })

      // Generate time series data
      const timeSeriesData = months.map((month, i) => {
        const dataPoint: any = { month }

        platforms.forEach((platform) => {
          // Add data for each metric if it's selected in filters
          if (filters.metrics.includes("leads")) {
            const platformData = leadsData.find((p) => p.name === platform)
            if (platformData) {
              dataPoint[`${platform} Leads`] = platformData.monthlyData[i].value
            }
          }

          if (filters.metrics.includes("income")) {
            const platformData = incomeData.find((p) => p.name === platform)
            if (platformData) {
              dataPoint[`${platform} Income`] = platformData.monthlyData[i].value
            }
          }

          if (filters.metrics.includes("expenses")) {
            const platformData = expensesData.find((p) => p.name === platform)
            if (platformData) {
              dataPoint[`${platform} Expenses`] = platformData.monthlyData[i].value
            }
          }
        })

        return dataPoint
      })

      return {
        leadsData,
        incomeData,
        expensesData,
        roiData,
        conversionData,
        timeSeriesData,
      }
    }

    // If no reports or no data extracted, fall back to sample data
    // This is the original sample data generation code

    // This would normally come from an API
    const platforms = ["Thumbtack", "Facebook", "Instagram", "Website", "Google Ads"]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Filter platforms if needed
    const filteredPlatforms = filters.platforms.includes("all")
      ? platforms
      : platforms.filter((p) => filters.platforms.some((f) => p.toLowerCase().includes(f)))

    // Generate leads data
    const leadsData = filteredPlatforms.map((platform) => {
      // Base values for each platform
      const baseValues = {
        Thumbtack: 87,
        Facebook: 64,
        Instagram: 53,
        Website: 42,
        "Google Ads": 38,
      }

      // Random variation for each month
      return {
        name: platform,
        value: baseValues[platform as keyof typeof baseValues] || 50,
        // Generate monthly data with some randomness
        monthlyData: months.map((month) => ({
          month,
          value: Math.round((baseValues[platform as keyof typeof baseValues] || 50) * (0.7 + Math.random() * 0.6)),
        })),
      }
    })

    // Generate income data
    const incomeData = filteredPlatforms.map((platform) => {
      // Base values for each platform
      const baseValues = {
        Thumbtack: 4350,
        Facebook: 3200,
        Instagram: 2650,
        Website: 2100,
        "Google Ads": 1900,
      }

      return {
        name: platform,
        value: baseValues[platform as keyof typeof baseValues] || 2000,
        monthlyData: months.map((month) => ({
          month,
          value: Math.round((baseValues[platform as keyof typeof baseValues] || 2000) * (0.7 + Math.random() * 0.6)),
        })),
      }
    })

    // Generate expenses data
    const expensesData = filteredPlatforms.map((platform) => {
      // Base values for each platform
      const baseValues = {
        Thumbtack: 1200,
        Facebook: 950,
        Instagram: 800,
        Website: 350,
        "Google Ads": 750,
      }

      return {
        name: platform,
        value: baseValues[platform as keyof typeof baseValues] || 800,
        monthlyData: months.map((month) => ({
          month,
          value: Math.round((baseValues[platform as keyof typeof baseValues] || 800) * (0.7 + Math.random() * 0.6)),
        })),
      }
    })

    // Generate ROI data
    const roiData = filteredPlatforms.map((platform) => {
      // Calculate ROI based on income and expenses
      const income = incomeData.find((p) => p.name === platform)?.value || 0
      const expenses = expensesData.find((p) => p.name === platform)?.value || 1 // Avoid division by zero
      const roi = income / expenses

      return {
        name: platform,
        value: Number.parseFloat(roi.toFixed(2)),
        monthlyData: months.map((month, index) => {
          const monthlyIncome = incomeData.find((p) => p.name === platform)?.monthlyData[index].value || 0
          const monthlyExpenses = expensesData.find((p) => p.name === platform)?.monthlyData[index].value || 1
          return {
            month,
            value: Number.parseFloat((monthlyIncome / monthlyExpenses).toFixed(2)),
          }
        }),
      }
    })

    // Generate conversion rate data
    const conversionData = filteredPlatforms.map((platform) => {
      // Base values for each platform
      const baseValues = {
        Thumbtack: 18,
        Facebook: 15,
        Instagram: 12,
        Website: 22,
        "Google Ads": 14,
      }

      return {
        name: platform,
        value: baseValues[platform as keyof typeof baseValues] || 15,
        monthlyData: months.map((month) => ({
          month,
          value: Math.round((baseValues[platform as keyof typeof baseValues] || 15) * (0.8 + Math.random() * 0.4)),
        })),
      }
    })

    return {
      leadsData,
      incomeData,
      expensesData,
      roiData,
      conversionData,
      // Combined data for time series
      timeSeriesData: months.map((month, i) => {
        const dataPoint: any = { month }

        filteredPlatforms.forEach((platform) => {
          // Add data for each metric if it's selected in filters
          if (filters.metrics.includes("leads")) {
            const platformData = leadsData.find((p) => p.name === platform)
            if (platformData) {
              dataPoint[`${platform} Leads`] = platformData.monthlyData[i].value
            }
          }

          if (filters.metrics.includes("income")) {
            const platformData = incomeData.find((p) => p.name === platform)
            if (platformData) {
              dataPoint[`${platform} Income`] = platformData.monthlyData[i].value
            }
          }

          if (filters.metrics.includes("expenses")) {
            const platformData = expensesData.find((p) => p.name === platform)
            if (platformData) {
              dataPoint[`${platform} Expenses`] = platformData.monthlyData[i].value
            }
          }
        })

        return dataPoint
      }),
    }
  }

  const data = generateData()

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Custom tooltip formatter
  const customTooltipFormatter = (value: number, name: string, entry: any, metric: string) => {
    if (metric === "income" || metric === "expenses") {
      return [formatCurrency(value), name]
    }
    if (metric === "roi") {
      return [`${value}x`, name]
    }
    if (metric === "conversion") {
      return [`${value}%`, name]
    }
    return [value, name]
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Marketing Performance Analytics</CardTitle>
          <CardDescription>
            Detailed analysis from {dateRange.from.toLocaleDateString()} to {dateRange.to.toLocaleDateString()}
          </CardDescription>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              {filters.metrics.includes("leads") && <TabsTrigger value="leads">Leads</TabsTrigger>}
              {filters.metrics.includes("income") && <TabsTrigger value="income">Income</TabsTrigger>}
              {filters.metrics.includes("expenses") && <TabsTrigger value="expenses">Expenses</TabsTrigger>}
              {filters.metrics.includes("roi") && <TabsTrigger value="roi">ROI</TabsTrigger>}
              {filters.metrics.includes("conversion") && <TabsTrigger value="conversion">Conversion</TabsTrigger>}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column: Bar/Pie chart */}
            <div className="h-80">
              {activeTab === "leads" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.leadsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [value, "Leads"]} />
                    <Legend />
                    <Bar dataKey="value" name="Leads" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === "income" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.incomeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Income"]} />
                    <Legend />
                    <Bar dataKey="value" name="Income" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === "expenses" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.expensesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), "Expenses"]} />
                    <Legend />
                    <Bar dataKey="value" name="Expenses" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === "roi" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.roiData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}x`, "ROI"]} />
                    <Legend />
                    <Bar dataKey="value" name="ROI" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeTab === "conversion" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.conversionData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, "Conversion Rate"]} />
                    <Legend />
                    <Bar dataKey="value" name="Conversion Rate" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Right column: Time series chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {data.timeSeriesData.length > 0 &&
                    Object.keys(data.timeSeriesData[0])
                      .filter((key) => key !== "month")
                      .map((key, index) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom section: Detailed metrics table */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Platform</th>
                    {filters.metrics.includes("leads") && <th className="text-right py-2">Leads</th>}
                    {filters.metrics.includes("income") && <th className="text-right py-2">Income</th>}
                    {filters.metrics.includes("expenses") && <th className="text-right py-2">Expenses</th>}
                    {filters.metrics.includes("roi") && <th className="text-right py-2">ROI</th>}
                    {filters.metrics.includes("conversion") && <th className="text-right py-2">Conversion</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.leadsData.map((platform, index) => (
                    <tr key={platform.name} className="border-b">
                      <td className="py-2">{platform.name}</td>
                      {filters.metrics.includes("leads") && (
                        <td className="text-right py-2">{data.leadsData[index].value}</td>
                      )}
                      {filters.metrics.includes("income") && (
                        <td className="text-right py-2">{formatCurrency(data.incomeData[index].value)}</td>
                      )}
                      {filters.metrics.includes("expenses") && (
                        <td className="text-right py-2">{formatCurrency(data.expensesData[index].value)}</td>
                      )}
                      {filters.metrics.includes("roi") && (
                        <td className="text-right py-2">{data.roiData[index].value}x</td>
                      )}
                      {filters.metrics.includes("conversion") && (
                        <td className="text-right py-2">{data.conversionData[index].value}%</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
