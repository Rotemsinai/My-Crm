"use client"

import { useState, useEffect } from "react"
import { Filter, ChevronDown, ChevronUp, FileSpreadsheet, Users, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MarketingFiltersProps {
  activeFilters: {
    reports: string[]
    platforms: string[]
    metrics: string[]
    campaigns: string[]
    leadStatus: string[]
    regions: string[]
    categories?: string[]
    vendors?: string[]
  }
  setActiveFilters: (filters: any) => void
}

export function MarketingFilters({ activeFilters, setActiveFilters }: MarketingFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterTab, setFilterTab] = useState("general")
  const [reports, setReports] = useState<any[]>([])
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([])
  const [vendors, setVendors] = useState<{ id: string; label: string }[]>([])

  // Load reports and extract categories and vendors
  useEffect(() => {
    const storedReports = JSON.parse(localStorage.getItem("reports") || "[]")
    setReports(storedReports)

    // Extract unique categories and vendors from financial reports
    const uniqueCategories = new Set<string>()
    const uniqueVendors = new Set<string>()

    storedReports.forEach((report: any) => {
      if (report.type === "financial" && report.data) {
        // Extract categories
        if (report.data.expenseCategories) {
          report.data.expenseCategories.forEach((category: any) => {
            if (category.category) {
              uniqueCategories.add(category.category)
            }
          })
        }
        if (report.data.incomeCategories) {
          report.data.incomeCategories.forEach((category: any) => {
            if (category.category) {
              uniqueCategories.add(category.category)
            }
          })
        }

        // Extract vendors
        if (report.data.vendors) {
          report.data.vendors.forEach((vendor: any) => {
            if (vendor.name) {
              uniqueVendors.add(vendor.name)
            }
          })
        }
      }
    })

    // Convert to array format for filters
    const categoryArray = Array.from(uniqueCategories).map((category) => ({
      id: category.toLowerCase().replace(/\s+/g, "-"),
      label: category,
    }))

    const vendorArray = Array.from(uniqueVendors).map((vendor) => ({
      id: vendor.toLowerCase().replace(/\s+/g, "-"),
      label: vendor,
    }))

    // Add default "all" option
    setCategories([{ id: "all", label: "All Categories" }, ...categoryArray])

    setVendors([{ id: "all", label: "All Vendors" }, ...vendorArray])
  }, [])

  const platforms = [
    { id: "all", label: "All Platforms" },
    { id: "thumbtack", label: "Thumbtack" },
    { id: "yelp", label: "Yelp" },
    { id: "networx", label: "Networx" },
    { id: "facebook", label: "Facebook" },
    { id: "google", label: "Google" },
  ]

  const metrics = [
    { id: "leads", label: "Leads" },
    { id: "income", label: "Income" },
    { id: "expenses", label: "Expenses" },
    { id: "roi", label: "ROI" },
    { id: "conversion", label: "Conversion Rate" },
    { id: "cpl", label: "Cost Per Lead" },
    { id: "cac", label: "Customer Acquisition Cost" },
    { id: "ltv", label: "Lifetime Value" },
  ]

  const campaigns = [
    { id: "all", label: "All Campaigns" },
    { id: "spring2023", label: "Spring 2023" },
    { id: "summer2023", label: "Summer 2023" },
    { id: "fall2023", label: "Fall 2023" },
    { id: "winter2023", label: "Winter 2023" },
    { id: "spring2024", label: "Spring 2024" },
  ]

  const leadStatus = [
    { id: "all", label: "All Statuses" },
    { id: "new", label: "New" },
    { id: "contacted", label: "Contacted" },
    { id: "qualified", label: "Qualified" },
    { id: "proposal", label: "Proposal" },
    { id: "negotiation", label: "Negotiation" },
    { id: "won", label: "Won" },
    { id: "lost", label: "Lost" },
  ]

  const regions = [
    { id: "all", label: "All Regions" },
    { id: "northeast", label: "Northeast" },
    { id: "southeast", label: "Southeast" },
    { id: "midwest", label: "Midwest" },
    { id: "southwest", label: "Southwest" },
    { id: "west", label: "West" },
    { id: "northwest", label: "Northwest" },
  ]

  const handleFilterChange = (category: string, id: string) => {
    setActiveFilters((prev: any) => {
      const currentFilters = [...prev[category]]

      // Handle "All" option special case
      if (id === "all") {
        return {
          ...prev,
          [category]: ["all"],
        }
      }

      // Remove "all" if it's there and we're selecting something specific
      const withoutAll = currentFilters.filter((f) => f !== "all")

      // Toggle the selected filter
      if (withoutAll.includes(id)) {
        const newFilters = withoutAll.filter((f) => f !== id)
        // If nothing left, default back to "all"
        return {
          ...prev,
          [category]: newFilters.length ? newFilters : ["all"],
        }
      } else {
        return {
          ...prev,
          [category]: [...withoutAll, id],
        }
      }
    })
  }

  const resetFilters = () => {
    setActiveFilters({
      reports: ["all"],
      platforms: ["all"],
      metrics: ["leads", "income", "expenses", "roi", "conversion"],
      campaigns: ["all"],
      leadStatus: ["all"],
      regions: ["all"],
      categories: ["all"],
      vendors: ["all"],
    })
  }

  // Count active filters (excluding "all" selections)
  const activeFilterCount = Object.entries(activeFilters).reduce((count, [category, values]) => {
    if (values.length === 1 && values[0] === "all") return count
    return count + values.length
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" onClick={resetFilters} size="sm">
          Reset
        </Button>
      </div>

      {isExpanded && (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={filterTab} onValueChange={setFilterTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
              </TabsList>
            </Tabs>

            {filterTab === "general" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Reports Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Reports</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {reports.map((report) => (
                      <div key={report.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`report-${report.id}`}
                          checked={activeFilters.reports.includes(report.id)}
                          onCheckedChange={() => handleFilterChange("reports", report.id)}
                        />
                        <Label htmlFor={`report-${report.id}`} className="flex items-center">
                          {report.type === "financial" ? (
                            <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                          ) : report.type === "employee" ? (
                            <Users className="h-4 w-4 mr-2 text-green-500" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4 mr-2 text-purple-500" />
                          )}
                          {report.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter will be here */}
              </div>
            )}

            {filterTab === "financial" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Categories Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Categories</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={activeFilters.categories?.includes(category.id)}
                          onCheckedChange={() => handleFilterChange("categories", category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`}>{category.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vendors Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Vendors</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vendor-${vendor.id}`}
                          checked={activeFilters.vendors?.includes(vendor.id)}
                          onCheckedChange={() => handleFilterChange("vendors", vendor.id)}
                        />
                        <Label htmlFor={`vendor-${vendor.id}`}>{vendor.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Metrics</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="metric-income"
                        checked={activeFilters.metrics.includes("income")}
                        onCheckedChange={() => handleFilterChange("metrics", "income")}
                      />
                      <Label htmlFor="metric-income">Income</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="metric-expenses"
                        checked={activeFilters.metrics.includes("expenses")}
                        onCheckedChange={() => handleFilterChange("metrics", "expenses")}
                      />
                      <Label htmlFor="metric-expenses">Expenses</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="metric-profit"
                        checked={activeFilters.metrics.includes("profit")}
                        onCheckedChange={() => handleFilterChange("metrics", "profit")}
                      />
                      <Label htmlFor="metric-profit">Profit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="metric-margin"
                        checked={activeFilters.metrics.includes("margin")}
                        onCheckedChange={() => handleFilterChange("metrics", "margin")}
                      />
                      <Label htmlFor="metric-margin">Profit Margin</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {filterTab === "marketing" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Platforms Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Platforms</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {platforms.map((platform) => (
                      <div key={platform.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`platform-${platform.id}`}
                          checked={activeFilters.platforms.includes(platform.id)}
                          onCheckedChange={() => handleFilterChange("platforms", platform.id)}
                        />
                        <Label htmlFor={`platform-${platform.id}`}>{platform.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Metrics</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`metric-${metric.id}`}
                          checked={activeFilters.metrics.includes(metric.id)}
                          onCheckedChange={() => handleFilterChange("metrics", metric.id)}
                        />
                        <Label htmlFor={`metric-${metric.id}`}>{metric.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaigns Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Campaigns</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`campaign-${campaign.id}`}
                          checked={activeFilters.campaigns.includes(campaign.id)}
                          onCheckedChange={() => handleFilterChange("campaigns", campaign.id)}
                        />
                        <Label htmlFor={`campaign-${campaign.id}`}>{campaign.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lead Status Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Lead Status</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {leadStatus.map((status) => (
                      <div key={status.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status.id}`}
                          checked={activeFilters.leadStatus.includes(status.id)}
                          onCheckedChange={() => handleFilterChange("leadStatus", status.id)}
                        />
                        <Label htmlFor={`status-${status.id}`}>{status.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regions Filter */}
                <div className="space-y-2">
                  <h3 className="font-medium">Regions</h3>
                  <Separator />
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {regions.map((region) => (
                      <div key={region.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`region-${region.id}`}
                          checked={activeFilters.regions.includes(region.id)}
                          onCheckedChange={() => handleFilterChange("regions", region.id)}
                        />
                        <Label htmlFor={`region-${region.id}`}>{region.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
