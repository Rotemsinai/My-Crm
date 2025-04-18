"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react"
import { CommissionRuleDialog } from "@/components/commission-rule-dialog"
import type { CommissionRule, TriggerType } from "@/types/performance-pay"

// Sample data - in a real app, this would come from your API
const sampleRules: CommissionRule[] = [
  {
    id: "1",
    name: "Standard Sales Commission",
    trigger: "sold",
    conditions: [],
    rateType: "percentage",
    rateValue: 10,
    allowSplits: true,
    createdAt: "2023-04-15T10:00:00Z",
    updatedAt: "2023-04-15T10:00:00Z",
    isActive: true,
  },
  {
    id: "2",
    name: "Premium Service Bonus",
    trigger: "done",
    conditions: [
      {
        property: "service_type",
        operator: "is_any_of",
        value: ["Premium", "VIP"],
      },
    ],
    rateType: "percentage",
    rateValue: 15,
    allowSplits: false,
    createdAt: "2023-05-20T14:30:00Z",
    updatedAt: "2023-06-10T09:15:00Z",
    isActive: true,
  },
  {
    id: "3",
    name: "New Customer Acquisition",
    trigger: "created",
    conditions: [
      {
        property: "customer_type",
        operator: "equals",
        value: "New",
      },
    ],
    rateType: "fixed",
    rateValue: 50,
    allowSplits: false,
    createdAt: "2023-07-05T11:45:00Z",
    updatedAt: "2023-07-05T11:45:00Z",
    isActive: false,
  },
  {
    id: "4",
    name: "High-Value Job Commission",
    trigger: "sold",
    conditions: [
      {
        property: "job_amount",
        operator: "greater_than",
        value: 5000,
      },
    ],
    rateType: "job_profit",
    rateValue: 20,
    allowSplits: true,
    createdAt: "2023-08-12T16:20:00Z",
    updatedAt: "2023-09-01T10:30:00Z",
    isActive: true,
  },
]

const getTriggerLabel = (trigger: TriggerType) => {
  switch (trigger) {
    case "sold":
      return "Sold by"
    case "done":
      return "Done by"
    case "created":
      return "Created by"
    default:
      return trigger
  }
}

const getRateLabel = (rule: CommissionRule) => {
  switch (rule.rateType) {
    case "percentage":
      return `${rule.rateValue}%`
    case "fixed":
      return `$${rule.rateValue.toFixed(2)}`
    case "job_profit":
      return `${rule.rateValue}% of profit`
    default:
      return `${rule.rateValue}`
  }
}

export function CommissionRulesList() {
  const [rules, setRules] = useState<CommissionRule[]>(sampleRules)

  const toggleRuleStatus = (id: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, isActive: !rule.isActive } : rule)))
  }

  const deleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id))
  }

  const duplicateRule = (rule: CommissionRule) => {
    const newRule = {
      ...rule,
      id: Math.random().toString(),
      name: `${rule.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setRules([...rules, newRule])
  }

  const saveRule = (updatedRule: CommissionRule) => {
    setRules(rules.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)))
  }

  const addRule = (newRule: CommissionRule) => {
    setRules([...rules, newRule])
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rule Name</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Commission</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No commission rules found. Create your first rule to get started.
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{rule.name}</TableCell>
                <TableCell>{getTriggerLabel(rule.trigger)}</TableCell>
                <TableCell>{getRateLabel(rule)}</TableCell>
                <TableCell>
                  {rule.conditions.length === 0 ? (
                    <span className="text-muted-foreground text-sm">None</span>
                  ) : (
                    <Badge variant="outline">{rule.conditions.length} condition(s)</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Switch checked={rule.isActive} onCheckedChange={() => toggleRuleStatus(rule.id)} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <CommissionRuleDialog rule={rule} onSave={saveRule}>
                          <Button variant="ghost" className="w-full justify-start px-2">
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                        </CommissionRuleDialog>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateRule(rule)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteRule(rule.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
