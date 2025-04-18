"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth, type UserRole, type User } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, Trash2, UserCog, DollarSign, Clock } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

// Extended user interface with additional properties
interface ExtendedUser extends User {
  profileColor?: string
  hourlyRate?: number
  workDays?: string[]
  paymentSchedule?: {
    frequency: "weekly" | "biweekly" | "monthly" | "custom"
    startDate: Date
    dayOfWeek?: number
    dayOfMonth?: number
  }
  paymentMethod?: string
  permissions?: {
    dashboard: boolean
    reports: boolean
    uploads: boolean
    exports: boolean
    insights: boolean
    users: boolean
    calendar: boolean
    settings: boolean
  }
  workHours?: {
    total: number
    lastUpdated: Date
  }
}

export default function UsersPage() {
  const { users: authUsers, addUser, deleteUser, user: currentUser, updateUser } = useAuth()
  const [users, setUsers] = useState<ExtendedUser[]>(
    authUsers.map((user) => ({
      ...user,
      profileColor: user.profileColor || "#39b4f3",
      hourlyRate: user.hourlyRate || 0,
      workDays: user.workDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      paymentSchedule: user.paymentSchedule || {
        frequency: "monthly",
        startDate: new Date(),
        dayOfMonth: 1,
      },
      paymentMethod: user.paymentMethod || "Direct Deposit",
      permissions: user.permissions || {
        dashboard: true,
        reports: user.role !== "viewer",
        uploads: user.role !== "viewer",
        exports: user.role !== "viewer",
        insights: user.role === "admin" || user.role === "analyst",
        users: user.role === "admin",
        calendar: true,
        settings: true,
      },
      workHours: user.workHours || {
        total: 0,
        lastUpdated: new Date(),
      },
    })),
  )

  const [newUser, setNewUser] = useState<Partial<ExtendedUser>>({
    username: "",
    email: "",
    name: "",
    role: "viewer" as UserRole,
    profileColor: "#39b4f3",
    hourlyRate: 0,
    workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    paymentSchedule: {
      frequency: "monthly",
      startDate: new Date(),
      dayOfMonth: 1,
    },
    paymentMethod: "Direct Deposit",
    permissions: {
      dashboard: true,
      reports: false,
      uploads: false,
      exports: false,
      insights: false,
      users: false,
      calendar: true,
      settings: true,
    },
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null)
  const [activeTab, setActiveTab] = useState("profile")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email || !newUser.name) {
      return
    }

    const userToAdd = {
      ...newUser,
      id: `user-${Date.now()}`,
      role: newUser.role || "viewer",
      profileColor: newUser.profileColor || "#39b4f3",
      hourlyRate: newUser.hourlyRate || 0,
      workDays: newUser.workDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      paymentSchedule: newUser.paymentSchedule || {
        frequency: "monthly",
        startDate: new Date(),
        dayOfMonth: 1,
      },
      paymentMethod: newUser.paymentMethod || "Direct Deposit",
      permissions: newUser.permissions || {
        dashboard: true,
        reports: false,
        uploads: false,
        exports: false,
        insights: false,
        users: false,
        calendar: true,
        settings: true,
      },
      workHours: {
        total: 0,
        lastUpdated: new Date(),
      },
    }

    addUser(userToAdd as any)
    setUsers((prev) => [...prev, userToAdd as ExtendedUser])

    setNewUser({
      username: "",
      email: "",
      name: "",
      role: "viewer",
      profileColor: "#39b4f3",
      hourlyRate: 0,
      workDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      paymentSchedule: {
        frequency: "monthly",
        startDate: new Date(),
        dayOfMonth: 1,
      },
      paymentMethod: "Direct Deposit",
      permissions: {
        dashboard: true,
        reports: false,
        uploads: false,
        exports: false,
        insights: false,
        users: false,
        calendar: true,
        settings: true,
      },
    })
    setIsDialogOpen(false)
  }

  const handleSendInvite = (email: string) => {
    // In a real app, this would call an API to send the email
    setEmailSent(true)
    setTimeout(() => setEmailSent(false), 3000)
  }

  const handleDeleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
    }
  }

  const handleEditUser = (user: ExtendedUser) => {
    setEditingUser(user)
    setActiveTab("profile")
  }

  const handleUpdateUser = () => {
    if (!editingUser) return

    updateUser(editingUser.id, editingUser as any)
    setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? editingUser : user)))
    setEditingUser(null)
  }

  const handleProfilePictureUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingUser) return

    // In a real app, you would upload the file to a server
    // For this demo, we'll just use a placeholder
    setEditingUser({
      ...editingUser,
      profilePicture: URL.createObjectURL(file),
    })
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "analyst":
        return "bg-blue-100 text-blue-800"
      case "viewer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateNextPayment = (user: ExtendedUser) => {
    if (!user.paymentSchedule) return "Not scheduled"

    const today = new Date()
    const nextPayment = new Date(user.paymentSchedule.startDate)

    switch (user.paymentSchedule.frequency) {
      case "weekly":
        // Set to next occurrence of the day of week
        const dayOfWeek = user.paymentSchedule.dayOfWeek || 5 // Default to Friday
        while (nextPayment < today || nextPayment.getDay() !== dayOfWeek) {
          nextPayment.setDate(nextPayment.getDate() + 1)
        }
        break
      case "biweekly":
        // Set to next occurrence of the day of week, then add weeks if needed
        const biweeklyDay = user.paymentSchedule.dayOfWeek || 5 // Default to Friday
        while (nextPayment < today || nextPayment.getDay() !== biweeklyDay) {
          nextPayment.setDate(nextPayment.getDate() + 1)
        }
        // If we just found the next occurrence but it's less than a week away,
        // add another week to make it biweekly
        if (nextPayment.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000) {
          nextPayment.setDate(nextPayment.getDate() + 7)
        }
        break
      case "monthly":
        // Set to the specified day of the current month
        const dayOfMonth = user.paymentSchedule.dayOfMonth || 1
        nextPayment.setDate(dayOfMonth)
        // If that day has already passed this month, move to next month
        if (nextPayment < today) {
          nextPayment.setMonth(nextPayment.getMonth() + 1)
        }
        break
      case "custom":
        // For custom, we'd need more logic, but for now just add a month
        nextPayment.setMonth(nextPayment.getMonth() + 1)
        break
    }

    return format(nextPayment, "PPP")
  }

  const calculateSalaryAmount = (user: ExtendedUser) => {
    if (!user.hourlyRate || !user.workHours) return "$0.00"

    const amount = user.hourlyRate * user.workHours.total
    return `$${amount.toFixed(2)}`
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage user access, permissions, and payroll</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-mrs-blue hover:bg-mrs-darkBlue">
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account with detailed settings</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name || ""}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email || ""}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUser.username || ""}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: UserRole) => {
                        const permissions = {
                          dashboard: true,
                          reports: value !== "viewer",
                          uploads: value !== "viewer",
                          exports: value !== "viewer",
                          insights: value === "admin" || value === "analyst",
                          users: value === "admin",
                          calendar: true,
                          settings: true,
                        }
                        setNewUser({ ...newUser, role: value, permissions })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileColor">Profile Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="profileColor"
                        type="color"
                        value={newUser.profileColor || "#39b4f3"}
                        onChange={(e) => setNewUser({ ...newUser, profileColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <div
                        className="w-10 h-10 rounded-full border"
                        style={{ backgroundColor: newUser.profileColor || "#39b4f3" }}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-dashboard"
                        checked={newUser.permissions?.dashboard}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              dashboard: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-dashboard"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Dashboard Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-reports"
                        checked={newUser.permissions?.reports}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              reports: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-reports"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Reports Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-uploads"
                        checked={newUser.permissions?.uploads}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              uploads: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-uploads"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Uploads Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-exports"
                        checked={newUser.permissions?.exports}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              exports: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-exports"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Exports Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-insights"
                        checked={newUser.permissions?.insights}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              insights: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-insights"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Insights Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-users"
                        checked={newUser.permissions?.users}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              users: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-users"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        User Management Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-calendar"
                        checked={newUser.permissions?.calendar}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              calendar: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-calendar"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Calendar Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permission-settings"
                        checked={newUser.permissions?.settings}
                        onCheckedChange={(checked) =>
                          setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions,
                              settings: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="permission-settings"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Settings Access
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="payroll" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={newUser.hourlyRate?.toString() || ""}
                        onChange={(e) => setNewUser({ ...newUser, hourlyRate: Number.parseFloat(e.target.value) })}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={newUser.paymentMethod}
                      onValueChange={(value: string) => setNewUser({ ...newUser, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                    <Select
                      value={newUser.paymentSchedule?.frequency}
                      onValueChange={(value: any) =>
                        setNewUser({
                          ...newUser,
                          paymentSchedule: {
                            ...newUser.paymentSchedule,
                            frequency: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        {/* <SelectItem value="custom">Custom</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>
                  {newUser.paymentSchedule?.frequency === "weekly" ||
                  newUser.paymentSchedule?.frequency === "biweekly" ? (
                    <div className="space-y-2">
                      <Label htmlFor="paymentDay">Payment Day</Label>
                      <Select
                        value={newUser.paymentSchedule?.dayOfWeek?.toString()}
                        onValueChange={(value: any) =>
                          setNewUser({
                            ...newUser,
                            paymentSchedule: {
                              ...newUser.paymentSchedule,
                              dayOfWeek: Number.parseInt(value),
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  {newUser.paymentSchedule?.frequency === "monthly" ? (
                    <div className="space-y-2">
                      <Label htmlFor="paymentDayOfMonth">Payment Day of Month</Label>
                      <Input
                        id="paymentDayOfMonth"
                        type="number"
                        value={newUser.paymentSchedule?.dayOfMonth?.toString() || ""}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            paymentSchedule: {
                              ...newUser.paymentSchedule,
                              dayOfMonth: Number.parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-24"
                      />
                    </div>
                  ) : null}
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Work Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`workday-${day}`}
                          checked={newUser.workDays?.includes(day)}
                          onCheckedChange={(checked) => {
                            const updatedWorkDays = checked
                              ? [...(newUser.workDays || []), day]
                              : (newUser.workDays || []).filter((d) => d !== day)
                            setNewUser({ ...newUser, workDays: updatedWorkDays })
                          }}
                        />
                        <Label
                          htmlFor={`workday-${day}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} className="bg-mrs-blue hover:bg-mrs-darkBlue">
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {emailSent && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Invitation email has been sent successfully.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                        <AvatarFallback className="bg-muted">{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Clock className="h-4 w-4" />
                            <span className="sr-only">Work Hours</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Total Hours: {user.workHours?.total}</p>
                            <p className="text-xs text-muted-foreground">
                              Last Updated:{" "}
                              {user.workHours?.lastUpdated ? format(user.workHours.lastUpdated, "PPP") : "Never"}
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <DollarSign className="h-4 w-4" />
                            <span className="sr-only">Payroll Info</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Hourly Rate: ${user.hourlyRate?.toFixed(2)}</p>
                            <p className="text-sm font-medium">Next Payment: {calculateNextPayment(user)}</p>
                            <p className="text-sm font-medium">Salary Amount: {calculateSalaryAmount(user)}</p>
                            <p className="text-xs text-muted-foreground">Payment Method: {user.paymentMethod}</p>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button variant="ghost" size="icon" onClick={() => handleSendInvite(user.email)}>
                        <Mail className="h-4 w-4" />
                        <span className="sr-only">Send Invite</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                        <UserCog className="h-4 w-4" />
                        <span className="sr-only">Edit User</span>
                      </Button>
                      {user.id !== "admin-1" && user.id !== currentUser?.id && (
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete User</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Make changes to the user's profile and settings</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <Tabs defaultValue="profile" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="payroll">Payroll</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={editingUser.name || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingUser.email || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">Username</Label>
                    <Input
                      id="edit-username"
                      value={editingUser.username || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-role">Role</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value: UserRole) => {
                        const permissions = {
                          dashboard: true,
                          reports: value !== "viewer",
                          uploads: value !== "viewer",
                          exports: value !== "viewer",
                          insights: value === "admin" || value === "analyst",
                          users: value === "admin",
                          calendar: true,
                          settings: true,
                        }
                        setEditingUser({ ...editingUser, role: value, permissions })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="analyst">Analyst</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-profileColor">Profile Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-profileColor"
                        type="color"
                        value={editingUser.profileColor || "#39b4f3"}
                        onChange={(e) => setEditingUser({ ...editingUser, profileColor: e.target.value })}
                        className="w-12 h-10 p-1"
                      />
                      <div
                        className="w-10 h-10 rounded-full border"
                        style={{ backgroundColor: editingUser.profileColor || "#39b4f3" }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={editingUser.profilePicture || "/placeholder.svg"} />
                        <AvatarFallback className="bg-muted">{editingUser.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm" onClick={handleProfilePictureUpload}>
                        Upload New
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-dashboard"
                        checked={editingUser.permissions?.dashboard}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              dashboard: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-dashboard"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Dashboard Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-reports"
                        checked={editingUser.permissions?.reports}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              reports: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-reports"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Reports Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-uploads"
                        checked={editingUser.permissions?.uploads}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              uploads: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-uploads"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Uploads Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-exports"
                        checked={editingUser.permissions?.exports}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              exports: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-exports"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Exports Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-insights"
                        checked={editingUser.permissions?.insights}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              insights: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-insights"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Insights Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-users"
                        checked={editingUser.permissions?.users}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              users: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-users"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        User Management Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-calendar"
                        checked={editingUser.permissions?.calendar}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              calendar: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-calendar"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Calendar Access
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-permission-settings"
                        checked={editingUser.permissions?.settings}
                        onCheckedChange={(checked) =>
                          setEditingUser({
                            ...editingUser,
                            permissions: {
                              ...editingUser.permissions,
                              settings: !!checked,
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="edit-permission-settings"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Settings Access
                      </label>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="payroll" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-hourlyRate">Hourly Rate</Label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <Input
                        id="edit-hourlyRate"
                        type="number"
                        value={editingUser.hourlyRate?.toString() || ""}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, hourlyRate: Number.parseFloat(e.target.value) })
                        }
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                    <Select
                      value={editingUser.paymentMethod}
                      onValueChange={(value: string) => setEditingUser({ ...editingUser, paymentMethod: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Direct Deposit">Direct Deposit</SelectItem>
                        <SelectItem value="Check">Check</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-paymentFrequency">Payment Frequency</Label>
                    <Select
                      value={editingUser.paymentSchedule?.frequency}
                      onValueChange={(value: any) =>
                        setEditingUser({
                          ...editingUser,
                          paymentSchedule: {
                            ...editingUser.paymentSchedule,
                            frequency: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        {/* <SelectItem value="custom">Custom</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </div>
                  {editingUser.paymentSchedule?.frequency === "weekly" ||
                  editingUser.paymentSchedule?.frequency === "biweekly" ? (
                    <div className="space-y-2">
                      <Label htmlFor="edit-paymentDay">Payment Day</Label>
                      <Select
                        value={editingUser.paymentSchedule?.dayOfWeek?.toString()}
                        onValueChange={(value: any) =>
                          setEditingUser({
                            ...editingUser,
                            paymentSchedule: {
                              ...editingUser.paymentSchedule,
                              dayOfWeek: Number.parseInt(value),
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                  {editingUser.paymentSchedule?.frequency === "monthly" ? (
                    <div className="space-y-2">
                      <Label htmlFor="edit-paymentDayOfMonth">Payment Day of Month</Label>
                      <Input
                        id="edit-paymentDayOfMonth"
                        type="number"
                        value={editingUser.paymentSchedule?.dayOfMonth?.toString() || ""}
                        onChange={(e) =>
                          setEditingUser({
                            ...editingUser,
                            paymentSchedule: {
                              ...editingUser.paymentSchedule,
                              dayOfMonth: Number.parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-24"
                      />
                    </div>
                  ) : null}
                </div>
              </TabsContent>
              <TabsContent value="schedule" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Work Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-workday-${day}`}
                          checked={editingUser.workDays?.includes(day)}
                          onCheckedChange={(checked) => {
                            const updatedWorkDays = checked
                              ? [...(editingUser.workDays || []), day]
                              : (editingUser.workDays || []).filter((d) => d !== day)
                            setEditingUser({ ...editingUser, workDays: updatedWorkDays })
                          }}
                        />
                        <Label
                          htmlFor={`edit-workday-${day}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="bg-mrs-blue hover:bg-mrs-darkBlue">
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
