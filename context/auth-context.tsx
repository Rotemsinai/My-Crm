"use client"

import { useContext } from "react"

import { createContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "admin" | "analyst" | "viewer"

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: UserRole
  lastLogin?: string
  permissions?: string[]
  profileColor?: string
  profileImage?: string
  hourlyRate?: number
  workingDays?: string[]
  paymentMethod?: string
  paymentFrequency?: string
  firstPaymentDate?: string
  totalHours?: number
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  users: User[]
  addUser: (user: Omit<User, "id" | "lastLogin">) => void
  deleteUser: (id: string) => void
  updateUser: (id: string, data: Partial<Omit<User, "id">>) => void
  setInitialPassword: (token: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users data
const initialUsers: User[] = [
  {
    id: "admin-1",
    username: "mrsgroup",
    email: "rotemsinaii@gmail.com",
    name: "MRS Admin",
    role: "admin",
    lastLogin: new Date().toISOString(),
    permissions: [
      "view_dashboard",
      "edit_dashboard_widgets",
      "view_reports",
      "create_reports",
      "export_reports",
      "view_users",
      "create_users",
      "edit_users",
      "delete_users",
      "view_calendar",
      "create_events",
      "edit_events",
      "delete_events",
      "upload_files",
      "analyze_uploads",
      "delete_uploads",
      "view_settings",
      "edit_settings",
    ],
    profileColor: "#39b4f3",
    hourlyRate: 0,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    paymentMethod: "bank_transfer",
    paymentFrequency: "monthly",
    firstPaymentDate: new Date().toISOString(),
    totalHours: 0,
  },
  {
    id: "viewer-1",
    username: "viewer1",
    email: "viewer1@example.com",
    name: "Viewer User",
    role: "viewer",
    lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    permissions: ["view_dashboard", "view_reports", "view_calendar"],
    profileColor: "#10b981",
    hourlyRate: 25,
    workingDays: ["monday", "wednesday", "friday"],
    paymentMethod: "bank_transfer",
    paymentFrequency: "biweekly",
    firstPaymentDate: new Date().toISOString(),
    totalHours: 42.5,
  },
  {
    id: "analyst-1",
    username: "analyst1",
    email: "analyst1@example.com",
    name: "Analyst User",
    role: "analyst",
    lastLogin: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    permissions: [
      "view_dashboard",
      "view_reports",
      "create_reports",
      "export_reports",
      "view_calendar",
      "create_events",
    ],
    profileColor: "#f59e0b",
    hourlyRate: 35,
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    paymentMethod: "paypal",
    paymentFrequency: "monthly",
    firstPaymentDate: new Date().toISOString(),
    totalHours: 160,
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("mrs-user")
    const savedUsers = localStorage.getItem("mrs-users")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      // Initialize with default users if none exist
      localStorage.setItem("mrs-users", JSON.stringify(initialUsers))
    }

    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)

    // Admin credentials
    if (username === "mrsgroup" && password === "mrsgroup12!@") {
      const adminUser = users.find((u) => u.username === "mrsgroup") || initialUsers[0]

      // Update last login
      const updatedUser = {
        ...adminUser,
        lastLogin: new Date().toISOString(),
      }

      setUser(updatedUser)

      // Update user in users array
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      setUsers(updatedUsers)

      // Store in both localStorage and cookies for redundancy
      localStorage.setItem("mrs-user", JSON.stringify(updatedUser))
      localStorage.setItem("mrs-users", JSON.stringify(updatedUsers))
      document.cookie = `mrs-user=${JSON.stringify(updatedUser)}; path=/; max-age=86400`

      setIsLoading(false)
      return true
    }

    // Viewer credentials
    if (username === "viewer1" && password === "viewer123!@") {
      const viewerUser = users.find((u) => u.username === "viewer1") || initialUsers[1]

      // Update last login
      const updatedUser = {
        ...viewerUser,
        lastLogin: new Date().toISOString(),
      }

      setUser(updatedUser)

      // Update user in users array
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      setUsers(updatedUsers)

      // Store in both localStorage and cookies for redundancy
      localStorage.setItem("mrs-user", JSON.stringify(updatedUser))
      localStorage.setItem("mrs-users", JSON.stringify(updatedUsers))
      document.cookie = `mrs-user=${JSON.stringify(updatedUser)}; path=/; max-age=86400`

      setIsLoading(false)
      return true
    }

    // Analyst credentials
    if (username === "analyst1" && password === "analyst123!@") {
      const analystUser = users.find((u) => u.username === "analyst1") || initialUsers[2]

      // Update last login
      const updatedUser = {
        ...analystUser,
        lastLogin: new Date().toISOString(),
      }

      setUser(updatedUser)

      // Update user in users array
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      setUsers(updatedUsers)

      // Store in both localStorage and cookies for redundancy
      localStorage.setItem("mrs-user", JSON.stringify(updatedUser))
      localStorage.setItem("mrs-users", JSON.stringify(updatedUsers))
      document.cookie = `mrs-user=${JSON.stringify(updatedUser)}; path=/; max-age=86400`

      setIsLoading(false)
      return true
    }

    // Check for custom users
    const foundUser = users.find((u) => u.username === username)
    if (foundUser) {
      // In a real app, you would verify the password hash here
      // For demo purposes, we'll just accept any password for custom users

      // Update last login
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
      }

      setUser(updatedUser)

      // Update user in users array
      const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      setUsers(updatedUsers)

      // Store in both localStorage and cookies for redundancy
      localStorage.setItem("mrs-user", JSON.stringify(updatedUser))
      localStorage.setItem("mrs-users", JSON.stringify(updatedUsers))
      document.cookie = `mrs-user=${JSON.stringify(updatedUser)}; path=/; max-age=86400`

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("mrs-user")
    router.push("/login")
  }

  const addUser = (userData: Omit<User, "id" | "lastLogin">) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      lastLogin: undefined,
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem("mrs-users", JSON.stringify(updatedUsers))
  }

  const deleteUser = (id: string) => {
    // Prevent deleting the main admin
    if (id === "admin-1") return

    const updatedUsers = users.filter((user) => user.id !== id)
    setUsers(updatedUsers)
    localStorage.setItem("mrs-users", JSON.stringify(updatedUsers))
  }

  const updateUser = (id: string, data: Partial<Omit<User, "id">>) => {
    const updatedUsers = users.map((user) => (user.id === id ? { ...user, ...data } : user))
    setUsers(updatedUsers)
    localStorage.setItem("mrs-users", JSON.stringify(updatedUsers))

    // If the current user is updated, update the current user state as well
    if (user && user.id === id) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("mrs-user", JSON.stringify(updatedUser))
    }
  }

  const setInitialPassword = async (token: string, password: string) => {
    // In a real app, this would verify the token and set the password
    // For demo purposes, we'll just return true
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        users,
        addUser,
        deleteUser,
        updateUser,
        setInitialPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
