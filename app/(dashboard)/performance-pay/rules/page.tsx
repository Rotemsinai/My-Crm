import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { CommissionRulesList } from "@/components/commission-rules-list"
import { CommissionRuleDialog } from "@/components/commission-rule-dialog"

export const metadata: Metadata = {
  title: "Commission Rules",
  description: "Manage your performance pay commission rules",
}

export default function CommissionRulesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Commission Rules</h1>
        <CommissionRuleDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Rule
          </Button>
        </CommissionRuleDialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Rules</CardTitle>
          <CardDescription>Manage your commission rules for performance pay</CardDescription>
        </CardHeader>
        <CardContent>
          <CommissionRulesList />
        </CardContent>
      </Card>
    </div>
  )
}
