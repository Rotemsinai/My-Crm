export type TriggerType = "sold" | "done" | "created"

export interface CommissionCondition {
  property: string
  operator: "equals" | "is_any_of" | "greater_than" | "less_than"
  value: any
}

export interface CommissionRule {
  id: string
  name: string
  trigger: TriggerType
  conditions: CommissionCondition[]
  rateType: "percentage" | "fixed" | "job_profit"
  rateValue: number
  allowSplits: boolean
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export interface CommissionEarning {
  id: string
  ruleId: string
  ruleName: string
  userId: string
  userName: string
  jobId: string
  jobName: string
  amount: number
  status: "pending" | "approved" | "paid"
  createdAt: string
  paidAt?: string
}
