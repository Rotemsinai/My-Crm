"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Facebook, Search } from "lucide-react"
import { format } from "date-fns"
import Image from "next/image"

interface MarketingLeadsProps {
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
  }
}

export function MarketingLeads({ dateRange, filters }: MarketingLeadsProps) {
  // This would normally come from an API or database
  // For now, we'll simulate different data based on the date range
  const getLeadData = () => {
    // Calculate days in the selected range
    const days = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))

    // Simulate different data based on range length
    const multiplier = days / 30 // Normalize to a month

    const platforms = [
      {
        name: "Thumbtack",
        leads: Math.round(87 * multiplier),
        income: Math.round(4350 * multiplier),
        expenses: Math.round(1200 * multiplier),
        growth: "+14%",
        period: `from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}`,
        logo: "/images/thumbtack-logo.png",
        color: "text-blue-500",
        bgColor: "bg-blue-100",
        roi: ((4350 * multiplier) / (1200 * multiplier)).toFixed(2),
        conversionRate: "18%",
      },
      {
        name: "Yelp",
        leads: Math.round(64 * multiplier),
        income: Math.round(3200 * multiplier),
        expenses: Math.round(950 * multiplier),
        growth: "+8%",
        period: `from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}`,
        logo: "/images/yelp-logo.png",
        color: "text-red-600",
        bgColor: "bg-red-50",
        roi: ((3200 * multiplier) / (950 * multiplier)).toFixed(2),
        conversionRate: "15%",
      },
      {
        name: "Networx",
        leads: Math.round(53 * multiplier),
        income: Math.round(2650 * multiplier),
        expenses: Math.round(800 * multiplier),
        growth: "+21%",
        period: `from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}`,
        logo: "/images/networx-logo.png",
        color: "text-green-500",
        bgColor: "bg-green-50",
        roi: ((2650 * multiplier) / (800 * multiplier)).toFixed(2),
        conversionRate: "12%",
      },
      {
        name: "Facebook",
        leads: Math.round(42 * multiplier),
        income: Math.round(2100 * multiplier),
        expenses: Math.round(350 * multiplier),
        growth: "+5%",
        period: `from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}`,
        icon: Facebook,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        roi: ((2100 * multiplier) / (350 * multiplier)).toFixed(2),
        conversionRate: "22%",
      },
      {
        name: "Google",
        leads: Math.round(38 * multiplier),
        income: Math.round(1900 * multiplier),
        expenses: Math.round(750 * multiplier),
        growth: "+11%",
        period: `from ${format(dateRange.from, "MMM d")} to ${format(dateRange.to, "MMM d")}`,
        icon: Search,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        roi: ((1900 * multiplier) / (750 * multiplier)).toFixed(2),
        conversionRate: "14%",
      },
    ]

    // Apply platform filters if not "all"
    if (!filters.platforms.includes("all")) {
      return platforms.filter((p) => {
        const platformId = p.name.toLowerCase()
        return filters.platforms.some((f) => platformId.includes(f))
      })
    }

    return platforms
  }

  const platforms = getLeadData()

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <>
      {platforms.map((platform) => (
        <Card key={platform.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{platform.name}</CardTitle>
            <div className={`rounded-full p-2 ${platform.bgColor}`}>
              {platform.logo ? (
                <div className="h-5 w-5 relative">
                  <Image
                    src={platform.logo || "/placeholder.svg"}
                    alt={`${platform.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : platform.icon ? (
                <platform.icon className={`h-4 w-4 ${platform.color}`} />
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filters.metrics.includes("leads") && (
                <div>
                  <div className="text-xs text-muted-foreground">Leads</div>
                  <div className="text-2xl font-bold">{platform.leads}</div>
                </div>
              )}

              {filters.metrics.includes("income") && (
                <div>
                  <div className="text-xs text-muted-foreground">Income</div>
                  <div className="text-lg font-semibold">{formatCurrency(platform.income)}</div>
                </div>
              )}

              {filters.metrics.includes("expenses") && (
                <div>
                  <div className="text-xs text-muted-foreground">Expenses</div>
                  <div className="text-lg font-semibold">{formatCurrency(platform.expenses)}</div>
                </div>
              )}

              {filters.metrics.includes("roi") && (
                <div>
                  <div className="text-xs text-muted-foreground">ROI</div>
                  <div className="text-lg font-semibold">{platform.roi}x</div>
                </div>
              )}

              {filters.metrics.includes("conversion") && (
                <div>
                  <div className="text-xs text-muted-foreground">Conversion</div>
                  <div className="text-lg font-semibold">{platform.conversionRate}</div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">
                  {platform.growth} {platform.period}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
