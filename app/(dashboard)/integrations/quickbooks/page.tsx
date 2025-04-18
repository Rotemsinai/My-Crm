"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getQuickBooksAuthUrl } from "@/lib/quickbooks/auth"
import { QuickBooksAPI, QuickBooksErrorType } from "@/lib/quickbooks/quickbooks-api"
import { QuickBooksDataSync, type SyncOptions } from "@/lib/quickbooks/data-sync"
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  WifiOff,
  Lock,
  AlertTriangle,
  Clock,
  HelpCircle,
} from "lucide-react"

export default function QuickBooksIntegrationPage() {
  const router = useRouter()
  const [isConnected, setIsConnected] = useState(false)
  const [authData, setAuthData] = useState<any>(null)
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "checking" | "connected" | "error"
    errorType?: QuickBooksErrorType
    errorMessage?: string
  }>({ status: "checking" })
  const [syncOptions, setSyncOptions] = useState<SyncOptions>({
    syncAccounts: true,
    syncCustomers: true,
    syncInvoices: true,
    syncBills: true,
    syncPayments: true,
    syncReports: true,
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0], // Jan 1 of current year
    endDate: new Date().toISOString().split("T")[0], // Today
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<any>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("connect")

  // Check if already connected to QuickBooks
  useEffect(() => {
    // In a real app, you would check if the user has valid QuickBooks credentials
    // For this demo, we'll check localStorage
    const storedAuthData = localStorage.getItem("qb_auth_data")
    if (storedAuthData) {
      try {
        const parsedAuthData = JSON.parse(storedAuthData)
        setAuthData(parsedAuthData)
        setIsConnected(true)

        // Test the connection
        testConnection(parsedAuthData)
      } catch (error) {
        console.error("Error parsing stored QuickBooks auth data:", error)
        setConnectionStatus({
          status: "error",
          errorType: QuickBooksErrorType.UNKNOWN,
          errorMessage: "Invalid authentication data. Please reconnect to QuickBooks.",
        })
      }
    } else {
      setConnectionStatus({ status: "error", errorType: QuickBooksErrorType.AUTHENTICATION })
    }

    // Check if there's any synced data
    const syncedData = localStorage.getItem("quickbooks_data")
    if (syncedData) {
      try {
        const parsedData = JSON.parse(syncedData)
        setLastSyncedAt(parsedData.syncedAt)
      } catch (error) {
        console.error("Error parsing stored QuickBooks data:", error)
      }
    }
  }, [])

  // Test connection to QuickBooks
  const testConnection = async (authDataToUse: any) => {
    setConnectionStatus({ status: "checking" })

    try {
      const api = new QuickBooksAPI(authDataToUse || authData)
      const result = await api.testConnection()

      if (result.success) {
        setConnectionStatus({ status: "connected" })
      } else {
        setConnectionStatus({
          status: "error",
          errorType: result.error.type,
          errorMessage: result.error.message,
        })
      }
    } catch (error) {
      console.error("Error testing QuickBooks connection:", error)
      setConnectionStatus({
        status: "error",
        errorType: QuickBooksErrorType.UNKNOWN,
        errorMessage: "An unexpected error occurred while testing the connection.",
      })
    }
  }

  // Handle connect to QuickBooks
  const handleConnect = () => {
    const authUrl = getQuickBooksAuthUrl()
    window.location.href = authUrl
  }

  // Handle disconnect from QuickBooks
  const handleDisconnect = () => {
    // In a real app, you would revoke the tokens
    localStorage.removeItem("qb_auth_data")
    localStorage.removeItem("quickbooks_data")
    setAuthData(null)
    setIsConnected(false)
    setSyncResult(null)
    setLastSyncedAt(null)
    setConnectionStatus({ status: "error", errorType: QuickBooksErrorType.AUTHENTICATION })
  }

  // Handle sync options change
  const handleSyncOptionChange = (option: keyof SyncOptions, value: any) => {
    setSyncOptions((prev) => ({
      ...prev,
      [option]: value,
    }))
  }

  // Handle sync data
  const handleSyncData = async () => {
    if (!authData) return

    setIsSyncing(true)
    setSyncResult(null)

    try {
      // Create QuickBooks API client
      const api = new QuickBooksAPI(authData)

      // Create data sync service
      const dataSync = new QuickBooksDataSync(api)

      // Sync data
      const result = await dataSync.syncData(syncOptions)

      setSyncResult(result)

      if (result.success) {
        setLastSyncedAt(new Date().toISOString())
      }
    } catch (error) {
      console.error("Error syncing QuickBooks data:", error)
      setSyncResult({
        success: false,
        error: error.message || "An unexpected error occurred while syncing data",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Get error icon based on error type
  const getErrorIcon = (errorType?: QuickBooksErrorType) => {
    switch (errorType) {
      case QuickBooksErrorType.AUTHENTICATION:
        return <Lock className="h-4 w-4 text-red-600" />
      case QuickBooksErrorType.CONNECTION:
        return <WifiOff className="h-4 w-4 text-red-600" />
      case QuickBooksErrorType.RATE_LIMIT:
        return <Clock className="h-4 w-4 text-red-600" />
      case QuickBooksErrorType.SERVER_ERROR:
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  // Get error title based on error type
  const getErrorTitle = (errorType?: QuickBooksErrorType) => {
    switch (errorType) {
      case QuickBooksErrorType.AUTHENTICATION:
        return "Authentication Error"
      case QuickBooksErrorType.CONNECTION:
        return "Connection Problem"
      case QuickBooksErrorType.RATE_LIMIT:
        return "Rate Limit Exceeded"
      case QuickBooksErrorType.SERVER_ERROR:
        return "QuickBooks Server Error"
      case QuickBooksErrorType.INVALID_REQUEST:
        return "Invalid Request"
      default:
        return "Connection Error"
    }
  }

  // Get error help text based on error type
  const getErrorHelp = (errorType?: QuickBooksErrorType) => {
    switch (errorType) {
      case QuickBooksErrorType.AUTHENTICATION:
        return "Your authentication with QuickBooks has expired or is invalid. Please reconnect your account."
      case QuickBooksErrorType.CONNECTION:
        return "We couldn't connect to QuickBooks. Please check your internet connection and try again."
      case QuickBooksErrorType.RATE_LIMIT:
        return "You've made too many requests to QuickBooks. Please wait a few minutes and try again."
      case QuickBooksErrorType.SERVER_ERROR:
        return "QuickBooks is experiencing server issues. Please try again later."
      case QuickBooksErrorType.INVALID_REQUEST:
        return "There was a problem with the request to QuickBooks. Please try reconnecting your account."
      default:
        return "There was a problem connecting to QuickBooks. Please try again or reconnect your account."
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">QuickBooks Integration</h2>
        <p className="text-muted-foreground">Connect your QuickBooks account to import financial data</p>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="sync" disabled={!isConnected || connectionStatus.status !== "connected"}>
            Sync Data
          </TabsTrigger>
          <TabsTrigger value="settings" disabled={!isConnected || connectionStatus.status !== "connected"}>
            Settings
          </TabsTrigger>
          <TabsTrigger value="troubleshoot" disabled={!isConnected}>
            Troubleshoot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connect to QuickBooks</CardTitle>
              <CardDescription>Connect your QuickBooks account to import financial data into your CRM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connectionStatus.status === "checking" ? (
                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  <AlertTitle>Checking connection...</AlertTitle>
                  <AlertDescription>
                    We're verifying your connection to QuickBooks. This will only take a moment.
                  </AlertDescription>
                </Alert>
              ) : connectionStatus.status === "connected" ? (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle>Connected to QuickBooks</AlertTitle>
                  <AlertDescription>
                    Your QuickBooks account is connected. You can now sync your financial data.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert className="bg-red-50 text-red-800 border-red-200">
                    {getErrorIcon(connectionStatus.errorType)}
                    <AlertTitle>{getErrorTitle(connectionStatus.errorType)}</AlertTitle>
                    <AlertDescription>
                      {connectionStatus.errorMessage || getErrorHelp(connectionStatus.errorType)}
                    </AlertDescription>
                  </Alert>

                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-2">Why connect to QuickBooks?</h3>
                    <p className="mb-3">
                      Connecting to QuickBooks allows you to import your financial data directly into your CRM. This
                      integration provides access to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Accounts and chart of accounts</li>
                      <li>Customer information</li>
                      <li>Invoices and payments</li>
                      <li>Bills and expenses</li>
                      <li>Financial reports (Profit & Loss, Balance Sheet, Cash Flow)</li>
                    </ul>
                  </div>

                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertTitle>Need Help?</AlertTitle>
                    <AlertDescription>
                      If you're having trouble connecting, make sure you have the correct QuickBooks credentials and
                      permissions. For more help, visit our{" "}
                      <a href="#" className="underline">
                        support page
                      </a>
                      .
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {connectionStatus.status === "connected" ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                  <Button onClick={() => setActiveTab("sync")}>
                    Go to Sync Data
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleConnect}>Connect to QuickBooks</Button>
                  {isConnected && (
                    <Button variant="outline" onClick={() => testConnection(authData)}>
                      Test Connection
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Data from QuickBooks</CardTitle>
              <CardDescription>Select what data you want to import from QuickBooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {lastSyncedAt && (
                <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                  <RefreshCw className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Last Synced</AlertTitle>
                  <AlertDescription>{new Date(lastSyncedAt).toLocaleString()}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sync-accounts"
                        checked={syncOptions.syncAccounts}
                        onCheckedChange={(checked) => handleSyncOptionChange("syncAccounts", checked)}
                      />
                      <Label htmlFor="sync-accounts">Accounts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sync-customers"
                        checked={syncOptions.syncCustomers}
                        onCheckedChange={(checked) => handleSyncOptionChange("syncCustomers", checked)}
                      />
                      <Label htmlFor="sync-customers">Customers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sync-invoices"
                        checked={syncOptions.syncInvoices}
                        onCheckedChange={(checked) => handleSyncOptionChange("syncInvoices", checked)}
                      />
                      <Label htmlFor="sync-invoices">Invoices</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sync-bills"
                        checked={syncOptions.syncBills}
                        onCheckedChange={(checked) => handleSyncOptionChange("syncBills", checked)}
                      />
                      <Label htmlFor="sync-bills">Bills</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sync-payments"
                        checked={syncOptions.syncPayments}
                        onCheckedChange={(checked) => handleSyncOptionChange("syncPayments", checked)}
                      />
                      <Label htmlFor="sync-payments">Payments</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sync-reports"
                        checked={syncOptions.syncReports}
                        onCheckedChange={(checked) => handleSyncOptionChange("syncReports", checked)}
                      />
                      <Label htmlFor="sync-reports">Financial Reports</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date Range for Reports and Transactions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={syncOptions.startDate}
                        onChange={(e) => handleSyncOptionChange("startDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={syncOptions.endDate}
                        onChange={(e) => handleSyncOptionChange("endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {syncResult && (
                <Alert
                  className={
                    syncResult.success
                      ? "bg-green-50 text-green-800 border-green-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }
                >
                  {syncResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertTitle>{syncResult.success ? "Sync Successful" : "Sync Failed"}</AlertTitle>
                  <AlertDescription>
                    {syncResult.success
                      ? "Your QuickBooks data has been successfully imported."
                      : syncResult.error || "An error occurred while syncing data."}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSyncData} disabled={isSyncing} className="relative">
                {isSyncing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                {isSyncing ? "Syncing..." : "Sync Data Now"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QuickBooks Integration Settings</CardTitle>
              <CardDescription>Configure how your QuickBooks data is imported and used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auto-sync">Auto-Sync Schedule</Label>
                <select id="auto-sync" className="w-full p-2 border rounded-md">
                  <option value="manual">Manual Only</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Data Handling</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="merge-customers" defaultChecked />
                    <Label htmlFor="merge-customers">Merge customers with existing CRM contacts</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="overwrite-data" defaultChecked />
                    <Label htmlFor="overwrite-data">Overwrite existing data on sync</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notifications</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-success" defaultChecked />
                    <Label htmlFor="notify-success">Notify on successful sync</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="notify-failure" defaultChecked />
                    <Label htmlFor="notify-failure">Notify on sync failure</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshoot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Troubleshoot QuickBooks Connection</CardTitle>
              <CardDescription>Diagnose and fix connection issues with QuickBooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connection Status</h3>
                {connectionStatus.status === "checking" ? (
                  <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    <AlertTitle>Checking connection...</AlertTitle>
                    <AlertDescription>
                      We're verifying your connection to QuickBooks. This will only take a moment.
                    </AlertDescription>
                  </Alert>
                ) : connectionStatus.status === "connected" ? (
                  <Alert className="bg-green-50 text-green-800 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle>Connected to QuickBooks</AlertTitle>
                    <AlertDescription>Your QuickBooks account is connected and working properly.</AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-50 text-red-800 border-red-200">
                    {getErrorIcon(connectionStatus.errorType)}
                    <AlertTitle>{getErrorTitle(connectionStatus.errorType)}</AlertTitle>
                    <AlertDescription>
                      {connectionStatus.errorMessage || getErrorHelp(connectionStatus.errorType)}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="rounded-lg border p-4 space-y-4">
                  <h3 className="font-medium">Common Connection Issues</h3>

                  <div className="space-y-2">
                    <h4 className="font-medium">Authentication Problems</h4>
                    <p>
                      If you're seeing authentication errors, your QuickBooks token may have expired. Try disconnecting
                      and reconnecting your account.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Connection Timeouts</h4>
                    <p>
                      Connection timeouts often indicate network issues. Check your internet connection and try again.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Rate Limiting</h4>
                    <p>
                      QuickBooks limits the number of API requests. If you're seeing rate limit errors, wait a few
                      minutes before trying again.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Server Errors</h4>
                    <p>
                      If QuickBooks is experiencing server issues, you may need to wait until their service is fully
                      operational again.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Connection Diagnostics</h3>
                <div className="grid gap-2">
                  <Button onClick={() => testConnection(authData)} className="w-full sm:w-auto">
                    Test Connection
                  </Button>
                  <Button variant="outline" onClick={handleDisconnect} className="w-full sm:w-auto">
                    Disconnect and Reconnect
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    View Connection Logs
                  </Button>
                </div>
              </div>

              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertTitle>Need More Help?</AlertTitle>
                <AlertDescription>
                  If you're still experiencing issues, please contact our support team or visit the{" "}
                  <a
                    href="https://help.quickbooks.intuit.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    QuickBooks Help Center
                  </a>
                  .
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
