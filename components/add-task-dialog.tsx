"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, PlusCircle, X } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { v4 as uuidv4 } from "uuid"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AddTaskDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  taskToEdit?: any
}

// Mock users data - in a real app, this would come from your API or database
const USERS = [
  { id: "user1", name: "John Doe", email: "john@example.com", avatar: "/green-tractor-field.png" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com", avatar: "/javascript-code-abstract.png" },
  { id: "user3", name: "Mike Johnson", email: "mike@example.com", avatar: "/musical-notes-flowing.png" },
  { id: "user4", name: "Sarah Williams", email: "sarah@example.com", avatar: "/abstract-southwest.png" },
  { id: "user5", name: "David Brown", email: "david@example.com", avatar: "/database-structure.png" },
]

export function AddTaskDialog({ open, onOpenChange, taskToEdit }: AddTaskDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [priority, setPriority] = useState<string>("medium")
  const [type, setType] = useState<string>("task")
  const [assignedUsers, setAssignedUsers] = useState<string[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<string>("weekly")
  const [customRecurrence, setCustomRecurrence] = useState({
    frequency: "weekly",
    interval: 1,
    weekdays: [] as string[],
    monthDay: 1,
    endType: "never",
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    occurrences: 10,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Sync internal state with props
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  // Load task data if editing
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title)
      setDescription(taskToEdit.description || "")
      setDate(new Date(taskToEdit.dueDate))
      setPriority(taskToEdit.priority)
      setType(taskToEdit.type || "task")
      setAssignedUsers(taskToEdit.assignedUsers || [])
      setIsRecurring(taskToEdit.isRecurring)
      setRecurrencePattern(taskToEdit.recurrencePattern || "weekly")
      if (taskToEdit.customRecurrence) {
        setCustomRecurrence(taskToEdit.customRecurrence)
      }
      setIsEditing(true)
    } else {
      setIsEditing(false)
    }
  }, [taskToEdit])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
    if (!newOpen) {
      resetForm()
    }
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDate(new Date())
    setPriority("medium")
    setType("task")
    setAssignedUsers([])
    setIsRecurring(false)
    setRecurrencePattern("weekly")
    setCustomRecurrence({
      frequency: "weekly",
      interval: 1,
      weekdays: [],
      monthDay: 1,
      endType: "never",
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      occurrences: 10,
    })
    setIsEditing(false)
    setSearchTerm("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    // Create task object
    const taskId = isEditing ? taskToEdit.id : uuidv4()
    const task = {
      id: taskId,
      title,
      description,
      dueDate: date.toISOString(),
      priority,
      status: isEditing ? taskToEdit.status : "todo",
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined,
      customRecurrence: isRecurring && recurrencePattern === "custom" ? customRecurrence : undefined,
      assignedUsers,
      createdAt: isEditing ? taskToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to localStorage
    const existingTasks = JSON.parse(localStorage.getItem("tasks") || "[]")

    if (isEditing) {
      // Update existing task
      const updatedTasks = existingTasks.map((t: any) => (t.id === taskId ? task : t))
      localStorage.setItem("tasks", JSON.stringify(updatedTasks))

      // Update calendar events
      updateCalendarEvents(task)
    } else {
      // Add new task
      localStorage.setItem("tasks", JSON.stringify([...existingTasks, task]))

      // Generate calendar events
      if (isRecurring) {
        const events = generateRecurringEvents(task)
        const existingEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
        localStorage.setItem("calendarEvents", JSON.stringify([...existingEvents, ...events]))
      } else {
        // Add as a single calendar event
        const event = {
          id: uuidv4(),
          title,
          date: date.toISOString(),
          taskId,
          allDay: true,
          type,
          assignedUsers,
        }
        const existingEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
        localStorage.setItem("calendarEvents", JSON.stringify([...existingEvents, event]))
      }
    }

    // Reset form and close dialog
    resetForm()
    handleOpenChange(false)
  }

  // Update calendar events for an edited task
  const updateCalendarEvents = (task: any) => {
    const existingEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]")

    // Remove all events for this task
    const filteredEvents = existingEvents.filter((event: any) => event.taskId !== task.id)

    // Generate new events if recurring
    if (task.isRecurring) {
      const newEvents = generateRecurringEvents(task)
      localStorage.setItem("calendarEvents", JSON.stringify([...filteredEvents, ...newEvents]))
    } else {
      // Add as a single calendar event
      const event = {
        id: uuidv4(),
        title: task.title,
        date: task.dueDate,
        taskId: task.id,
        allDay: true,
        type: task.type || "task",
        assignedUsers: task.assignedUsers,
      }
      localStorage.setItem("calendarEvents", JSON.stringify([...filteredEvents, event]))
    }
  }

  // Generate recurring events based on pattern
  function generateRecurringEvents(task: any) {
    const events = []
    const startDate = new Date(task.dueDate)
    let endDate: Date

    if (task.recurrencePattern === "custom") {
      const custom = task.customRecurrence

      if (custom.endType === "date") {
        endDate = new Date(custom.endDate)
      } else if (custom.endType === "occurrences") {
        // For occurrences, we'll calculate the end date later
        endDate = new Date(startDate)
        endDate.setFullYear(endDate.getFullYear() + 2) // Temporary large value
      } else {
        // "never" - generate for 2 years
        endDate = new Date(startDate)
        endDate.setFullYear(endDate.getFullYear() + 2)
      }
    } else {
      // Standard patterns - generate for 1 year
      endDate = new Date(startDate)
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    const currentDate = new Date(startDate)
    let occurrenceCount = 0

    while (currentDate <= endDate) {
      // For custom occurrences, stop after reaching the limit
      if (
        task.recurrencePattern === "custom" &&
        task.customRecurrence.endType === "occurrences" &&
        occurrenceCount >= task.customRecurrence.occurrences
      ) {
        break
      }

      // For custom weekday selection, check if the current day is selected
      if (
        task.recurrencePattern === "custom" &&
        task.customRecurrence.frequency === "weekly" &&
        task.customRecurrence.weekdays.length > 0
      ) {
        const dayOfWeek = currentDate.getDay().toString()
        if (!task.customRecurrence.weekdays.includes(dayOfWeek)) {
          // Skip this day if not selected
          currentDate.setDate(currentDate.getDate() + 1)
          continue
        }
      }

      // For custom monthly, check if it's the right day of month
      if (
        task.recurrencePattern === "custom" &&
        task.customRecurrence.frequency === "monthly" &&
        currentDate.getDate() !== task.customRecurrence.monthDay
      ) {
        // Skip this day if not the selected day of month
        currentDate.setDate(currentDate.getDate() + 1)
        continue
      }

      events.push({
        id: uuidv4(),
        title: task.title,
        date: new Date(currentDate).toISOString(),
        taskId: task.id,
        allDay: true,
        type: task.type || "task",
        assignedUsers: task.assignedUsers,
        recurring: true,
        recurrencePattern: task.recurrencePattern,
        instanceDate: new Date(currentDate).toISOString(), // Store the specific instance date
        completed: false,
      })

      occurrenceCount++

      // Increment date based on recurrence pattern
      if (task.recurrencePattern === "custom") {
        const custom = task.customRecurrence

        switch (custom.frequency) {
          case "daily":
            currentDate.setDate(currentDate.getDate() + custom.interval)
            break
          case "weekly":
            if (custom.weekdays.length > 0) {
              // If specific weekdays are selected, move to next day and check in the loop
              currentDate.setDate(currentDate.getDate() + 1)
            } else {
              // Otherwise, jump by the interval weeks
              currentDate.setDate(currentDate.getDate() + 7 * custom.interval)
            }
            break
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + custom.interval)
            // Ensure we're on the right day of month
            currentDate.setDate(custom.monthDay)
            break
          case "yearly":
            currentDate.setFullYear(currentDate.getFullYear() + custom.interval)
            break
        }
      } else {
        // Standard patterns
        switch (task.recurrencePattern) {
          case "daily":
            currentDate.setDate(currentDate.getDate() + 1)
            break
          case "weekly":
            currentDate.setDate(currentDate.getDate() + 7)
            break
          case "monthly":
            currentDate.setMonth(currentDate.getMonth() + 1)
            break
          case "yearly":
            currentDate.setFullYear(currentDate.getFullYear() + 1)
            break
        }
      }
    }

    return events
  }

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setAssignedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      } else {
        return [...prev, userId]
      }
    })
  }

  // Filter users based on search term
  const filteredUsers = USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get user by ID
  const getUserById = (userId: string) => {
    return USERS.find((user) => user.id === userId)
  }

  // Remove assigned user
  const removeAssignedUser = (userId: string) => {
    setAssignedUsers((prev) => prev.filter((id) => id !== userId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update task details" : "Create a new task with details and due date."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Due Date</Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Priority
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned Users Section */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Assign To</Label>
            <div className="col-span-3 space-y-2">
              {/* Display selected users */}
              {assignedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {assignedUsers.map((userId) => {
                    const user = getUserById(userId)
                    if (!user) return null
                    return (
                      <Badge key={userId} variant="secondary" className="flex items-center gap-1 py-1 px-2">
                        <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-5 h-5 rounded-full" />
                        <span>{user.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeAssignedUser(userId)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* User selection popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Assign users
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <div className="p-2">
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-2"
                    />
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2 p-2">
                        {filteredUsers.map((user) => (
                          <div key={user.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`user-${user.id}`}
                              checked={assignedUsers.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                            <div className="flex items-center gap-2">
                              <img
                                src={user.avatar || "/placeholder.svg"}
                                alt={user.name}
                                className="w-6 h-6 rounded-full"
                              />
                              <Label htmlFor={`user-${user.id}`} className="flex flex-col">
                                <span>{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </Label>
                            </div>
                          </div>
                        ))}
                        {filteredUsers.length === 0 && (
                          <div className="text-center py-2 text-muted-foreground">No users found</div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label htmlFor="recurring">Recurring</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox id="recurring" checked={isRecurring} onCheckedChange={(checked) => setIsRecurring(!!checked)} />
              <label
                htmlFor="recurring"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Make this a recurring task
              </label>
            </div>
          </div>
          {isRecurring && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Recurrence</Label>
              <div className="col-span-3 space-y-4">
                <RadioGroup
                  value={recurrencePattern}
                  onValueChange={setRecurrencePattern}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Daily</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly">Yearly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Custom</Label>
                  </div>
                </RadioGroup>

                {recurrencePattern === "custom" && (
                  <div className="border p-4 rounded-md space-y-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={customRecurrence.frequency}
                        onValueChange={(val) => setCustomRecurrence({ ...customRecurrence, frequency: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Repeat every</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          max="99"
                          value={customRecurrence.interval}
                          onChange={(e) =>
                            setCustomRecurrence({
                              ...customRecurrence,
                              interval: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20"
                        />
                        <span>
                          {customRecurrence.frequency === "daily"
                            ? "days"
                            : customRecurrence.frequency === "weekly"
                              ? "weeks"
                              : customRecurrence.frequency === "monthly"
                                ? "months"
                                : "years"}
                        </span>
                      </div>
                    </div>

                    {customRecurrence.frequency === "weekly" && (
                      <div className="space-y-2">
                        <Label>On these days</Label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: "0", label: "Sun" },
                            { value: "1", label: "Mon" },
                            { value: "2", label: "Tue" },
                            { value: "3", label: "Wed" },
                            { value: "4", label: "Thu" },
                            { value: "5", label: "Fri" },
                            { value: "6", label: "Sat" },
                          ].map((day) => (
                            <div key={day.value} className="flex items-center space-x-1">
                              <Checkbox
                                id={`day-${day.value}`}
                                checked={customRecurrence.weekdays.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setCustomRecurrence({
                                      ...customRecurrence,
                                      weekdays: [...customRecurrence.weekdays, day.value],
                                    })
                                  } else {
                                    setCustomRecurrence({
                                      ...customRecurrence,
                                      weekdays: customRecurrence.weekdays.filter((d) => d !== day.value),
                                    })
                                  }
                                }}
                              />
                              <Label htmlFor={`day-${day.value}`} className="text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {customRecurrence.frequency === "monthly" && (
                      <div className="space-y-2">
                        <Label>Day of month</Label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={customRecurrence.monthDay}
                          onChange={(e) =>
                            setCustomRecurrence({
                              ...customRecurrence,
                              monthDay: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-20"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>End</Label>
                      <RadioGroup
                        value={customRecurrence.endType}
                        onValueChange={(val) => setCustomRecurrence({ ...customRecurrence, endType: val })}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="never" id="end-never" />
                          <Label htmlFor="end-never">Never</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="date" id="end-date" />
                          <Label htmlFor="end-date">On date</Label>
                          {customRecurrence.endType === "date" && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="ml-2 w-[180px] justify-start text-left font-normal"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {format(customRecurrence.endDate, "PPP")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={customRecurrence.endDate}
                                  onSelect={(date) =>
                                    date &&
                                    setCustomRecurrence({
                                      ...customRecurrence,
                                      endDate: date,
                                    })
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="occurrences" id="end-occurrences" />
                          <Label htmlFor="end-occurrences">After</Label>
                          {customRecurrence.endType === "occurrences" && (
                            <div className="flex items-center ml-2">
                              <Input
                                type="number"
                                min="1"
                                max="999"
                                value={customRecurrence.occurrences}
                                onChange={(e) =>
                                  setCustomRecurrence({
                                    ...customRecurrence,
                                    occurrences: Number.parseInt(e.target.value) || 10,
                                  })
                                }
                                className="w-20 mr-2"
                              />
                              <span>occurrences</span>
                            </div>
                          )}
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Update" : "Create"} Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
