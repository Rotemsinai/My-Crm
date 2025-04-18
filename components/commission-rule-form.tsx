"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Rule name must be at least 2 characters.",
  }),
  trigger: z.enum(["sold", "done", "created"] as const),
  conditions: z.array(
    z.object({
      property: z.string(),
      operator: z.string(),
      value: z.string(),
    }),
  ),
  rateType: z.enum(["percentage", "fixed", "job_profit"] as const),
  rateValue: z.coerce.number().min(0),
  allowSplits: z.boolean().default(false),
})

export function CommissionRuleForm() {
  const router = useRouter()
  const [conditions, setConditions] = useState<{ id: string; property: string; operator: string; value: string }[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      trigger: "sold",
      conditions: [],
      rateType: "percentage",
      rateValue: 0,
      allowSplits: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would save the rule to your backend
    console.log(values)

    // Navigate back to the rules list
    router.push("/performance-pay/rules")
  }

  const addCondition = () => {
    setConditions([...conditions, { id: Math.random().toString(), property: "", operator: "is_any_of", value: "" }])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter((condition) => condition.id !== id))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule name</FormLabel>
              <FormControl>
                <Input placeholder="Enter rule name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <h3 className="text-lg font-medium mb-4">Trigger status</h3>
          <FormField
            control={form.control}
            name="trigger"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-md p-4 w-full sm:w-1/3">
                      <RadioGroupItem value="sold" id="sold" />
                      <FormLabel htmlFor="sold" className="font-normal cursor-pointer">
                        <div className="font-medium">Sold by</div>
                        <p className="text-sm text-muted-foreground">Applies to jobs/items sold by a user</p>
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-4 w-full sm:w-1/3">
                      <RadioGroupItem value="done" id="done" />
                      <FormLabel htmlFor="done" className="font-normal cursor-pointer">
                        <div className="font-medium">Done by</div>
                        <p className="text-sm text-muted-foreground">Applies to jobs assigned to a user</p>
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-md p-4 w-full sm:w-1/3">
                      <RadioGroupItem value="created" id="created" />
                      <FormLabel htmlFor="created" className="font-normal cursor-pointer">
                        <div className="font-medium">Created by</div>
                        <p className="text-sm text-muted-foreground">Applies to jobs created by a user</p>
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Conditions <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addCondition}>
              <Plus className="h-4 w-4 mr-2" />
              Add Condition
            </Button>
          </div>

          {conditions.length === 0 ? (
            <div className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center">
              No conditions added. The rule will apply to all jobs that match the trigger.
            </div>
          ) : (
            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <Card key={condition.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                      <div className="w-full sm:w-1/3">
                        <FormLabel className="text-sm">Select property</FormLabel>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="job_type">Job Type</SelectItem>
                            <SelectItem value="job_status">Job Status</SelectItem>
                            <SelectItem value="job_amount">Job Amount</SelectItem>
                            <SelectItem value="customer_type">Customer Type</SelectItem>
                            <SelectItem value="service_type">Service Type</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full sm:w-1/4">
                        <FormLabel className="text-sm">Operator</FormLabel>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="is any of" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="is_any_of">is any of</SelectItem>
                            <SelectItem value="is_none_of">is none of</SelectItem>
                            <SelectItem value="greater_than">greater than</SelectItem>
                            <SelectItem value="less_than">less than</SelectItem>
                            <SelectItem value="equals">equals</SelectItem>
                            <SelectItem value="not_equals">not equals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-full sm:w-1/3">
                        <FormLabel className="text-sm">Value</FormLabel>
                        <Input placeholder="Enter value" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(condition.id)}
                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-4">Commission rate</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rateValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <Input
                        type="number"
                        min={0}
                        step={form.watch("rateType") === "percentage" ? 0.01 : 1}
                        {...field}
                      />
                      <FormField
                        control={form.control}
                        name="rateType"
                        render={({ field }) => (
                          <FormItem className="ml-2 w-40">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="fixed">$</SelectItem>
                                <SelectItem value="job_profit">of job profit</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="allowSplits"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Allow commission splits</FormLabel>
                <FormDescription>Enable this to allow commissions to be split between multiple users</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/performance-pay/rules")}>
            Cancel
          </Button>
          <Button type="submit">Create Rule</Button>
        </div>
      </form>
    </Form>
  )
}
