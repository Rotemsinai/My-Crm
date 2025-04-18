"use client"

import { useState, useEffect } from "react"
import { Plus, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

// Types for calendar events
interface CalendarEvent {
  id: string
  title: string
  date: string
  endDate?: string
  allDay: boolean
  type: "task" | "meeting" | "reminder" | "payment"
  taskId?: string
  completed?: boolean
  recurring?: boolean
  recurrencePattern?: string
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("month")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [filterTypes, setFilterTypes] = useState<string[]>([])
  const [showCompleted, setShowCompleted] = useState(true)

  // Load events from localStorage
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents")
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents))
    }
  }, [])

  // Filter events based on selected filters
  useEffect(() => {
    let filtered = [...events]

    if (filterTypes.length > 0) {
      filtered = filtered.filter((event) => filterTypes.includes(event.type))
    }

    if (!showCompleted) {
      filtered = filtered.filter((event) => !event.completed)
    }

    setFilteredEvents(filtered)
  }, [events, filterTypes, showCompleted])

  const toggleTypeFilter = (type: string) => {
    setFilterTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  // Helper function to get event color based on type
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-100 text-blue-800"
      case "meeting":
        return "bg-purple-100 text-purple-800"
      case "reminder":
        return "bg-amber-100 text-amber-800"
      case "payment":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Generate days for month view
  const getDaysInMonth = (year: number, month: number) => {
    const date = new Date(year, month, 1)
    const days = []

    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay()

    // Add previous month's days to fill the first week
    for (let i = 0; i < firstDay; i++) {
      const prevDate = new Date(year, month, -i)
      days.unshift(prevDate)
    }

    // Add days of current month
    while (date.getMonth() === month) {
      days.push(new Date(date))
      date.setDate(date.getDate() + 1)
    }

    // Add days to complete the last week
    const lastDay = days[days.length - 1].getDay()
    for (let i = 1; i < 7 - lastDay; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push(nextDate)
    }

    return days
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">Manage your schedule, tasks, and events</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {(filterTypes.length > 0 || !showCompleted) && (
                  <Badge variant="secondary" className="ml-1 rounded-full px-1 py-0">
                    {filterTypes.length + (!showCompleted ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Filter by Type</h4>
                  <div className="space-y-2">
                    {["task", "meeting", "reminder", "payment"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={filterTypes.includes(type)}
                          onCheckedChange={() => toggleTypeFilter(type)}
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-completed"
                    checked={showCompleted}
                    onCheckedChange={(checked) => setShowCompleted(!!checked)}
                  />
                  <label
                    htmlFor="show-completed"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show completed tasks
                  </label>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={() => setIsAddTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="month"
        className="space-y-4"
        onValueChange={(value) => setView(value as "day" | "week" | "month")}
      >
        <TabsList>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>
        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Calendar - {format(date, "MMMM yyyy")}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}
                  >
                    Next
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium py-2">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(date.getFullYear(), date.getMonth()).map((day, i) => {
                  const isCurrentMonth = day.getMonth() === date.getMonth()
                  const isToday = day.toDateString() === new Date().toDateString()
                  const dayEvents = filteredEvents.filter(
                    (event) =>
                      new Date(event.date).getDate() === day.getDate() &&
                      new Date(event.date).getMonth() === day.getMonth() &&
                      new Date(event.date).getFullYear() === day.getFullYear(),
                  )

                  return (
                    <div
                      key={i}
                      className={`min-h-[100px] border rounded-md p-1 ${
                        isCurrentMonth ? "bg-background" : "bg-muted/50"
                      } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <div className="text-right text-sm font-medium mb-1">{day.getDate()}</div>
                      <div className="space-y-1 max-h-[80px] overflow-auto">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)} ${
                              event.completed ? "line-through opacity-50" : ""
                            }`}
                          >
                            {event.title}
                            {event.recurring && (
                              <span className="ml-1 text-xs">
                                ({event.recurrencePattern?.charAt(0).toUpperCase() + event.recurrencePattern?.slice(1)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Week of {format(date, "MMM d, yyyy")}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(date)
                      newDate.setDate(newDate.getDate() - 7)
                      setDate(newDate)
                    }}
                  >
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(date)
                      newDate.setDate(newDate.getDate() + 7)
                      setDate(newDate)
                    }}
                  >
                    Next
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const day = new Date(date)
                  day.setDate(day.getDate() - day.getDay() + i)
                  const isToday = day.toDateString() === new Date().toDateString()
                  const dayEvents = filteredEvents.filter(
                    (event) =>
                      new Date(event.date).getDate() === day.getDate() &&
                      new Date(event.date).getMonth() === day.getMonth() &&
                      new Date(event.date).getFullYear() === day.getFullYear(),
                  )

                  return (
                    <div key={i} className="space-y-2">
                      <div
                        className={`text-center font-medium p-2 rounded-md ${
                          isToday ? "bg-blue-500 text-white" : "bg-muted"
                        }`}
                      >
                        {format(day, "EEE")}
                        <br />
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1 max-h-[400px] overflow-auto">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`p-2 rounded text-sm ${getEventTypeColor(event.type)} ${
                              event.completed ? "line-through opacity-50" : ""
                            }`}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs">
                              {event.allDay ? "All Day" : format(new Date(event.date), "h:mm a")}
                              {event.recurring && (
                                <span className="ml-1">
                                  (
                                  {event.recurrencePattern?.charAt(0).toUpperCase() + event.recurrencePattern?.slice(1)}
                                  )
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{format(date, "EEEE, MMMM d, yyyy")}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(date)
                      newDate.setDate(newDate.getDate() - 1)
                      setDate(newDate)
                    }}
                  >
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(date)
                      newDate.setDate(newDate.getDate() + 1)
                      setDate(newDate)
                    }}
                  >
                    Next
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const hourEvents = filteredEvents.filter(
                    (event) =>
                      new Date(event.date).getDate() === date.getDate() &&
                      new Date(event.date).getMonth() === date.getMonth() &&
                      new Date(event.date).getFullYear() === date.getFullYear() &&
                      (event.allDay || new Date(event.date).getHours() === hour),
                  )

                  return (
                    <div key={hour} className="flex border-t pt-2">
                      <div className="w-16 text-right pr-4 text-muted-foreground">
                        {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                      </div>
                      <div className="flex-1 space-y-1">
                        {hourEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`p-2 rounded text-sm ${getEventTypeColor(event.type)} ${
                              event.completed ? "line-through opacity-50" : ""
                            }`}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-xs">
                              {event.allDay ? "All Day" : format(new Date(event.date), "h:mm a")}
                              {event.recurring && (
                                <span className="ml-1">
                                  (
                                  {event.recurrencePattern?.charAt(0).toUpperCase() + event.recurrencePattern?.slice(1)}
                                  )
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
    </div>
  )
}
