"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, AlertCircle, Clock, CheckCircle2 } from "lucide-react"

// Mock users data - in a real app, this would come from your API or database
const USERS = [
  { id: "user1", name: "John Doe", email: "john@example.com", avatar: "/green-tractor-field.png" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com", avatar: "/javascript-code-abstract.png" },
  { id: "user3", name: "Mike Johnson", email: "mike@example.com", avatar: "/musical-notes-flowing.png" },
  { id: "user4", name: "Sarah Williams", email: "sarah@example.com", avatar: "/abstract-southwest.png" },
  { id: "user5", name: "David Brown", email: "david@example.com", avatar: "/database-structure.png" },
]

export function TasksList() {
  const [tasks, setTasks] = useState<any[]>([])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<any>(null)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    setTasks(storedTasks)

    // Set up event listener for storage changes
    const handleStorageChange = () => {
      const updatedTasks = JSON.parse(localStorage.getItem("tasks") || "[]")
      setTasks(updatedTasks)
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const handleTaskComplete = (taskId: string, isCompleted: boolean) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          status: isCompleted ? "completed" : "todo",
          updatedAt: new Date().toISOString(),
        }
      }
      return task
    })

    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))

    // Update calendar events if needed
    const events = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
    const updatedEvents = events.map((event: any) => {
      if (event.taskId === taskId) {
        return {
          ...event,
          completed: isCompleted,
        }
      }
      return event
    })
    localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
  }

  const handleEditTask = (task: any) => {
    setTaskToEdit(task)
    setIsAddTaskOpen(true)
  }

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))

    // Remove associated calendar events
    const events = JSON.parse(localStorage.getItem("calendarEvents") || "[]")
    const updatedEvents = events.filter((event: any) => event.taskId !== taskId)
    localStorage.setItem("calendarEvents", JSON.stringify(updatedEvents))
  }

  const handleAddTaskClose = () => {
    setIsAddTaskOpen(false)
    setTaskToEdit(null)
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true
    if (filter === "completed") return task.status === "completed"
    if (filter === "todo") return task.status === "todo"
    if (filter === "overdue") {
      return task.status !== "completed" && new Date(task.dueDate) < new Date()
    }
    if (filter === "today") {
      const today = new Date()
      const taskDate = new Date(task.dueDate)
      return (
        task.status !== "completed" &&
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      )
    }
    return true
  })

  // Sort tasks by due date (most recent first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  // Get user by ID
  const getUserById = (userId: string) => {
    return USERS.find((user) => user.id === userId)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All
          </Button>
          <Button variant={filter === "todo" ? "default" : "outline"} size="sm" onClick={() => setFilter("todo")}>
            To Do
          </Button>
          <Button
            variant={filter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
          >
            Completed
          </Button>
          <Button variant={filter === "overdue" ? "default" : "outline"} size="sm" onClick={() => setFilter("overdue")}>
            Overdue
          </Button>
          <Button variant={filter === "today" ? "default" : "outline"} size="sm" onClick={() => setFilter("today")}>
            Today
          </Button>
        </div>
        <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
          Add Task
        </Button>
      </div>

      <div className="border rounded-md">
        {sortedTasks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No tasks found</div>
        ) : (
          <div className="divide-y">
            {sortedTasks.map((task) => {
              const isOverdue = task.status !== "completed" && new Date(task.dueDate) < new Date()
              const isToday = (() => {
                const today = new Date()
                const taskDate = new Date(task.dueDate)
                return (
                  taskDate.getDate() === today.getDate() &&
                  taskDate.getMonth() === today.getMonth() &&
                  taskDate.getFullYear() === today.getFullYear()
                )
              })()

              return (
                <div
                  key={task.id}
                  className={`p-4 flex items-start justify-between ${task.status === "completed" ? "bg-muted/50" : ""}`}
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={task.status === "completed"}
                      onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
                      className="mt-1"
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center">
                        <p
                          className={`font-medium ${
                            task.status === "completed" ? "line-through text-muted-foreground" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.isRecurring && (
                          <Badge variant="outline" className="ml-2">
                            Recurring
                          </Badge>
                        )}
                        {task.priority === "high" && (
                          <Badge variant="destructive" className="ml-2">
                            High Priority
                          </Badge>
                        )}
                      </div>
                      {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span
                          className={`flex items-center ${
                            isOverdue ? "text-destructive" : isToday ? "text-amber-500" : ""
                          }`}
                        >
                          {isOverdue ? (
                            <AlertCircle className="mr-1 h-3 w-3" />
                          ) : isToday ? (
                            <Clock className="mr-1 h-3 w-3" />
                          ) : task.status === "completed" ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span>Type: {task.type}</span>
                      </div>

                      {/* Display assigned users */}
                      {task.assignedUsers && task.assignedUsers.length > 0 && (
                        <div className="flex items-center mt-2 flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Assigned to:</span>
                          {task.assignedUsers.map((userId: string) => {
                            const user = getUserById(userId)
                            if (!user) return null
                            return (
                              <Avatar key={userId} className="h-6 w-6">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>
                                  {user.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTaskComplete(task.id, !task.status === "completed")}>
                        {task.status === "completed" ? "Mark as Incomplete" : "Mark as Complete"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={handleAddTaskClose} taskToEdit={taskToEdit} />
    </div>
  )
}
