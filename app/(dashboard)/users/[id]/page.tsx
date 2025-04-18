"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, Calendar, DollarSign, Clock, CreditCard, Upload } from "lucide-react"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Define the permissions structure
const permissionGroups = [
  {
    name: "Dashboard",
    permissions: ["view_dashboard", "edit_dashboard_widgets"],
  },
  {
    name: "Reports",
    permissions: ["view_reports", "create_reports", "export_reports"],
  },
  {
    name: "Users",
    permissions: ["view_users", "create_users", "edit_users", "delete_users"],
  },
  {
    name: "Calendar",
    permissions: ["view_calendar", "create_events", "edit_events", "delete_events"],
  },
  {
    name: "Uploads",
    permissions: ["upload_files", "analyze_uploads", "delete_uploads"],
  },
  {
    name: "Settings",
    permissions: ["view_settings", "edit_settings"],
  },
]

// Define payment methods
const paymentMethods = [
  { id: "bank_transfer", name: "Bank Transfer" },
  { id: "paypal", name: "PayPal" },
  { id: "check", name: "Check" },
  { id: "cash", name: "Cash" },
  { id: "other", name: "Other" },
]

// Define work days
const workDays = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
  { id: "saturday", name: "Saturday" },
  { id: "sunday", name: "Sunday" },
]

// Define payment frequencies
const paymentFrequencies = [
  { id: "weekly", name: "Weekly" },
  { id: "biweekly", name: "Bi-weekly" },
  { id: "monthly", name: "Monthly" },
  { id: "last_day", name: "Last day of month" },
  { id: "custom", name: "Custom" },
]

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { users, updateUser } = useAuth()
  const userId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [profileColor, setProfileColor] = useState("#39b4f3")
  const [hourlyRate, setHourlyRate] = useState("0")
  const [workingDays, setWorkingDays] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [paymentFrequency, setPaymentFrequency] = useState("monthly")
  const [firstPaymentDate, setFirstPaymentDate] = useState<Date>(new Date())
  const [timeTracking, setTimeTracking] = useState({
    totalHours: 0,
    currentSession: 0,
    isTracking: false,
    sessionStart: null as Date | null,
  })

  // Colors for profile
  const colorOptions = [
    "#39b4f3", // MRS Blue
    "#10b981", // Green
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#6b7280", // Gray
  ]

  useEffect(() => {
    if (users.length > 0) {
      const foundUser = users.find((u) => u.id === userId)
      if (foundUser) {
        setUser(foundUser)

        // Initialize with default values or from user object if they exist
        setSelectedPermissions(foundUser.permissions || [])
        setProfileColor(foundUser.profileColor || "#39b4f3")
        setHourlyRate(foundUser.hourlyRate?.toString() || "0")
        setWorkingDays(foundUser.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday"])
        setPaymentMethod(foundUser.paymentMethod || "bank_transfer")
        setPaymentFrequency(foundUser.paymentFrequency || "monthly")
        setFirstPaymentDate(foundUser.firstPaymentDate ? new Date(foundUser.firstPaymentDate) : new Date())

        // Initialize time tracking
        setTimeTracking({
          totalHours: foundUser.totalHours || 0,
          currentSession: 0,
          isTracking: false,
          sessionStart: null,
        })
      } else {
        router.push("/users")
      }
      setLoading(false)
    }
  }, [users, userId, router])

  const handleSave = () => {
    if (!user) return

    const updatedUser = {
      ...user,
      permissions: selectedPermissions,
      profileColor,
      hourlyRate: Number.parseFloat(hourlyRate),
      workingDays,
      paymentMethod,
      paymentFrequency,
      firstPaymentDate: firstPaymentDate.toISOString(),
      totalHours: timeTracking.totalHours,
    }

    updateUser(userId, updatedUser)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission) ? prev.filter((p) => p !== permission) : [...prev, permission],
    )
  }

  const toggleWorkDay = (day: string) => {
    setWorkingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const handleStartTimeTracking = () => {
    setTimeTracking({
      ...timeTracking,
      isTracking: true,
      sessionStart: new Date(),
      currentSession: 0,
    })

    // Start the timer
    const timer = setInterval(() => {
      setTimeTracking((prev) => {
        if (!prev.sessionStart || !prev.isTracking) {
          clearInterval(timer)
          return prev
        }

        const now = new Date()
        const elapsedHours = (now.getTime() - prev.sessionStart.getTime()) / (1000 * 60 * 60)

        return {
          ...prev,
          currentSession: elapsedHours,
        }
      })
    }, 1000)

    // Clean up the timer
    return () => clearInterval(timer)
  }

  const handleStopTimeTracking = () => {
    if (!timeTracking.sessionStart) return

    const now = new Date()
    const elapsedHours = (now.getTime() - timeTracking.sessionStart.getTime()) / (1000 * 60 * 60)

    setTimeTracking({
      isTracking: false,
      sessionStart: null,
      currentSession: 0,
      totalHours: timeTracking.totalHours + elapsedHours,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading user details...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>User not found</p>
      </div>
    )
  }

  // Calculate next payment date based on frequency and first payment date
  const calculateNextPaymentDate = () => {
    const today = new Date()
    const firstDate = new Date(firstPaymentDate)

    switch (paymentFrequency) {
      case "weekly": {
        const dayDiff = 7 - ((today.getDay() - firstDate.getDay() + 7) % 7)
        const nextDate = new Date(today)
        nextDate.setDate(today.getDate() + dayDiff)
        return nextDate
      }
      case "biweekly": {
        const dayDiff = 14 - ((today.getDay() - firstDate.getDay() + 14) % 14)
        const nextDate = new Date(today)
        nextDate.setDate(today.getDate() + dayDiff)
        return nextDate
      }
      case "monthly": {
        const nextDate = new Date(today.getFullYear(), today.getMonth(), firstDate.getDate())
        if (nextDate < today) {
          nextDate.setMonth(nextDate.getMonth() + 1)
        }
        return nextDate
      }
      case "last_day": {
        const nextDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        return nextDate
      }
      default:
        return firstDate
    }
  }

  const nextPaymentDate = calculateNextPaymentDate()
  const estimatedPayment = Number.parseFloat(hourlyRate) * timeTracking.totalHours

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
          <p className="text-muted-foreground">Manage user profile, permissions, and payment settings</p>
        </div>
        <Button onClick={() => router.push("/users")} variant="outline">
          Back to Users
        </Button>
      </div>

      {saved && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>User settings have been saved successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>User information and profile settings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImage || "/placeholder.svg?height=96&width=96"} />
                <AvatarFallback style={{ backgroundColor: profileColor }}>
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0 bg-mrs-blue hover:bg-mrs-darkBlue"
              >
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload avatar</span>
              </Button>
            </div>

            <div className="space-y-2 w-full">
              <Label>Profile Color</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    className={`h-8 w-8 rounded-full ${profileColor === color ? "ring-2 ring-offset-2 ring-mrs-blue" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setProfileColor(color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={user.name} readOnly />
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} readOnly />
            </div>

            <div className="space-y-2 w-full">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Configure user permissions and payment settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="permissions">
              <TabsList className="mb-4">
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="timetracking">Time Tracking</TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-4">
                {permissionGroups.map((group) => (
                  <div key={group.name} className="space-y-2">
                    <h3 className="font-medium">{group.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.permissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={selectedPermissions.includes(permission)}
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          <label
                            htmlFor={permission}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {permission
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentFrequency">Payment Frequency</Label>
                    <Select value={paymentFrequency} onValueChange={setPaymentFrequency}>
                      <SelectTrigger id="paymentFrequency">
                        <SelectValue placeholder="Select payment frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentFrequencies.map((frequency) => (
                          <SelectItem key={frequency.id} value={frequency.id}>
                            {frequency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>First Payment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {firstPaymentDate ? format(firstPaymentDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={firstPaymentDate}
                          onSelect={(date) => date && setFirstPaymentDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Working Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {workDays.map((day) => (
                      <Button
                        key={day.id}
                        variant={workingDays.includes(day.id) ? "default" : "outline"}
                        className={workingDays.includes(day.id) ? "bg-mrs-blue hover:bg-mrs-darkBlue" : ""}
                        onClick={() => toggleWorkDay(day.id)}
                      >
                        {day.name.substring(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>

                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Payment Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Next Payment Date:</span>
                        <span className="font-medium">{format(nextPaymentDate, "PPP")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Hours Worked:</span>
                        <span className="font-medium">{timeTracking.totalHours.toFixed(2)} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hourly Rate:</span>
                        <span className="font-medium">${Number.parseFloat(hourlyRate).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Payment:</span>
                        <span className="font-medium">${estimatedPayment.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium">
                          {paymentMethods.find((m) => m.id === paymentMethod)?.name || paymentMethod}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timetracking" className="space-y-4">
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Time Tracking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Session</p>
                          <p className="text-2xl font-bold">{timeTracking.currentSession.toFixed(2)} hours</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Hours</p>
                          <p className="text-2xl font-bold">{timeTracking.totalHours.toFixed(2)} hours</p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        {!timeTracking.isTracking ? (
                          <Button onClick={handleStartTimeTracking} className="bg-green-600 hover:bg-green-700">
                            <Clock className="mr-2 h-4 w-4" />
                            Start Time Tracking
                          </Button>
                        ) : (
                          <Button onClick={handleStopTimeTracking} variant="destructive">
                            <Clock className="mr-2 h-4 w-4" />
                            Stop Time Tracking
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Earnings Summary</p>
                        <div className="flex justify-between">
                          <span>Hourly Rate:</span>
                          <span>${Number.parseFloat(hourlyRate).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Session Earnings:</span>
                          <span>${(Number.parseFloat(hourlyRate) * timeTracking.currentSession).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Earnings:</span>
                          <span>${(Number.parseFloat(hourlyRate) * timeTracking.totalHours).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <h3 className="font-medium">Payment Schedule</h3>
                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    <Calendar className="h-5 w-5 text-mrs-blue" />
                    <div>
                      <p className="font-medium">Next Payment: {format(nextPaymentDate, "PPP")}</p>
                      <p className="text-sm text-muted-foreground">
                        {paymentFrequencies.find((f) => f.id === paymentFrequency)?.name || paymentFrequency} payments
                        starting from {format(firstPaymentDate, "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Estimated Payment: ${estimatedPayment.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Based on {timeTracking.totalHours.toFixed(2)} hours at $
                        {Number.parseFloat(hourlyRate).toFixed(2)}/hour
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">
                        Payment Method: {paymentMethods.find((m) => m.id === paymentMethod)?.name || paymentMethod}
                      </p>
                      <p className="text-sm text-muted-foreground">Update payment details in the Payment tab</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} className="ml-auto bg-mrs-blue hover:bg-mrs-darkBlue">
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
