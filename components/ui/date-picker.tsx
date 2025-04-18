"use client"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePicker({
  className,
  classNames,
  value,
  onChange,
  placeholder,
  ...props
}: {
  className?: string
  classNames?: Record<string, string>
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-[280px] justify-start text-left font-normal", !value && "text-muted-foreground", className)}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>{placeholder || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          className={cn("border-none shadow-md", className)}
          classNames={{
            ...classNames,
            day: cn(
              "p-0 relative text-center text-sm focus:outline-none focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              classNames?.day,
            ),
            day_selected: cn(
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              !value && "opacity-50",
            ),
            day_today: cn("text-accent", classNames?.day_today),
            day_outside: cn("text-muted-foreground opacity-50", classNames?.day_outside),
            ...classNames,
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
