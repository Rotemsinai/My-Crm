"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function QuickBooksConnectedPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [connectionData, setConnectionData] = useState<any>(null)

  useEffect(() => {
    // In a real app, you would verify the connection here
    // For this demo, we'll just simulate a successful connection
    const timer = setTimeout(() => {
      setIsLoading(false)
      setConnectionData({
        companyName: "Your Company",
        connectionTime: new Date().toLocaleString(),
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">QuickBooks Connected</h2>
        <p className="text-muted-foreground">Your QuickBooks account has been successfully connected</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Successful</CardTitle>
          <CardDescription>Your QuickBooks account is now connected to your CRM</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Connected Successfully</AlertTitle>
                <AlertDescription>
                  Your QuickBooks account has been successfully connected to your CRM.
                </AlertDescription>
              </Alert>

              {connectionData && (
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Company:</span>
                    <span>{connectionData.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Connected at:</span>
                    <span>{connectionData.connectionTime}</span>
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-2">What's Next?</h3>
                <p className="mb-3">Now that your QuickBooks account is connected, you can:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Sync your financial data</li>
                  <li>Import customers, invoices, and transactions</li>
                  <li>Generate financial reports</li>
                  <li>View your financial data in your CRM</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/integrations/quickbooks")}>
            Go to QuickBooks Integration
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
