"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle } from "lucide-react"
import type { CommissionRule, CommissionCondition, TriggerType } from "@/types/performance-pay"

interface CommissionRuleDialogProps {
  children: React.ReactNode
  rule?: CommissionRule
  onSave?: (rule: CommissionRule) => void
}

export function CommissionRuleDialog({ children, rule, onSave }: CommissionRuleDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<CommissionRule>>(
    rule || {
      name: "",
      trigger: "sold",
      conditions: [],
      rateType: "percentage",
      rateValue: 10,
      allowSplits: false,
    },
  )
  const [conditions, setConditions] = useState<CommissionCondition[]>(rule?.conditions || [])
  const [showConditionForm, setShowConditionForm] = useState(false)
  const [newCondition, setNewCondition] = useState<Partial<CommissionCondition>>({
    property: "",
    operator: "equals",
    value: "",
  })

  const isEditing = !!rule

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: Number.parseFloat(value) || 0,
    })
  }

  const handleAddCondition = () => {
    if (newCondition.property && newCondition.operator) {
      const condition = { ...newCondition } as CommissionCondition
      setConditions([...conditions, condition])
      setNewCondition({
        property: "",
        operator: "equals",
        value: "",
      })
      setShowConditionForm(false)
    }
  }

  const handleRemoveCondition = (index: number) => {
    const updatedConditions = [...conditions]
    updatedConditions.splice(index, 1)
    setConditions(updatedConditions)
  }

  const handleSave = () => {
    if (!formData.name) return

    const newRule: CommissionRule = {
      id: rule?.id || Math.random().toString(),
      name: formData.name as string,
      trigger: formData.trigger as TriggerType,
      conditions: conditions,
      rateType: formData.rateType as "percentage" | "fixed" | "job_profit",
      rateValue: formData.rateValue as number,
      allowSplits: formData.allowSplits as boolean,
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: rule?.isActive !== undefined ? rule.isActive : true,
    }

    if (onSave) {
      onSave(newRule)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit commission rule" : "New commission rule"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your commission rule."
              : "Create a new commission rule for performance pay."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rule-name">Rule name</Label>
            <Input
              id="rule-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter rule name"
            />
          </div>

          <div className="grid gap-2">
            <Label>Trigger status</Label>
            <RadioGroup
              value={formData.trigger}
              onValueChange={(value) => handleSelectChange("trigger", value)}
              className="flex gap-4"
            >
              <div className="flex items-start space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="sold" id="sold" className="mt-1" />
                <div className="grid gap-1">
                  <Label htmlFor="sold" className="font-medium cursor-pointer">
                    Sold by
                  </Label>
                  <p className="text-sm text-muted-foreground">Applies to line items sold by a user</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="done" id="done" className="mt-1" />
                <div className="grid gap-1">
                  <Label htmlFor="done" className="font-medium cursor-pointer">
                    Done by
                  </Label>
                  <p className="text-sm text-muted-foreground">Applies to jobs assigned to a user</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="created" id="created" className="mt-1" />
                <div className="grid gap-1">
                  <Label htmlFor="created" className="font-medium cursor-pointer">
                    Created by
                  </Label>
                  <p className="text-sm text-muted-foreground">Applies to jobs created by a user</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Conditions (optional)</Label>
              {!showConditionForm && (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowConditionForm(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add condition
                </Button>
              )}
            </div>

            {conditions.length > 0 && (
              <div className="border rounded-md p-3 space-y-2">
                {conditions.map((condition, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      {condition.property} {condition.operator} {condition.value}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveCondition(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {showConditionForm && (
              <div className="border rounded-md p-3 grid gap-3">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="property">Select property</Label>
                    <Select
                      value={newCondition.property}
                      onValueChange={(value) => setNewCondition({ ...newCondition, property: value })}
                    >
                      <SelectTrigger id="property">
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="service_type">Service Type</SelectItem>
                        <SelectItem value="job_amount">Job Amount</SelectItem>
                        <SelectItem value="customer_type">Customer Type</SelectItem>
                        <SelectItem value="job_category">Job Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="operator">Is any of</Label>
                    <Select
                      value={newCondition.operator}
                      onValueChange={(value) => setNewCondition({ ...newCondition, operator: value })}
                    >
                      <SelectTrigger id="operator">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="is_any_of">Is any of</SelectItem>
                        <SelectItem value="greater_than">Greater than</SelectItem>
                        <SelectItem value="less_than">Less than</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Select property</Label>
                    <Input
                      id="value"
                      value={newCondition.value}
                      onChange={(e) => setNewCondition({ ...newCondition, value: e.target.value })}
                      placeholder="Enter value"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowConditionForm(false)}>
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={handleAddCondition}>
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Commission rate</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                name="rateValue"
                value={formData.rateValue}
                onChange={handleNumberChange}
                className="w-24"
              />
              <Select value={formData.rateType} onValueChange={(value) => handleSelectChange("rateType", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">%</SelectItem>
                  <SelectItem value="fixed">$</SelectItem>
                  <SelectItem value="job_profit">% of job profit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allow-splits"
              name="allowSplits"
              checked={formData.allowSplits}
              onCheckedChange={(checked) => setFormData({ ...formData, allowSplits: checked as boolean })}
            />
            <Label htmlFor="allow-splits">Allow commission splits</Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {isEditing ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
