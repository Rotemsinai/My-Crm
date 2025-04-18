"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { QuickBooksErrorType } from "@/lib/quickbooks/error-handling"

export default function QuickBooksErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorType, setErrorType] = useState<QuickBooksErrorType>(QuickBooksErrorType.UNKNOWN)
  const [errorMessage, setErrorMessage] = useState<string>("An unknown error occurred")

  useEffect(() => {
    const type = searchParams.get("type") as QuickBooksErrorType
    const message = searchParams.get("message")

    if (type) {
      setErrorType(type)
    }

    if (message) {
      setErrorMessage(message)
    }
  }, [searchParams])

  // Get troubleshooting steps based on error type
  const getTroubleshootingSteps = () => {
    switch (errorType) {
      case QuickBooksErrorType.AUTHENTICATION:
        return [
          "Check that your Client ID and Client Secret are correct",
          "Ensure your app is properly configured in the QuickBooks Developer portal",
          "Verify that your Redirect URI matches exactly what's configured in the QuickBooks Developer portal",
          "Try disconnecting and reconnecting your QuickBooks account",
        ]
      case QuickBooksErrorType.CONNECTION:
        return [
          "Check your internet connection",
          "Verify that QuickBooks services are operational",
          "Try again in a few minutes",
          "Check if your firewall or network is blocking connections to QuickBooks",
        ]
      case QuickBooksErrorType.RATE_LIMIT:
        return [
          "Wait a few minutes before trying again",
          "Reduce the frequency of your API requests",
          "Consider implementing caching to reduce API calls",
        ]
      case QuickBooksErrorType.SERVER_ERROR:
        return [
          "This is an issue with QuickBooks servers",
          "Check the QuickBooks system status page",
          "Try again later when the service is stable",
        ]
      default:
        return [
          "Try the connection process again",
          "Check your app configuration in the QuickBooks Developer portal",
          "Verify that all required environment variables are set correctly",
          "Contact support if the issue persists",
        ]
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">QuickBooks Connection Error</h2>
        <p className="text-muted-foreground">There was a problem connecting to QuickBooks</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Error</CardTitle>
          <CardDescription>We encountered an error while connecting to QuickBooks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error: {errorType}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="text-lg font-medium">Troubleshooting Steps</h3>
            <ul className="list-disc pl-5 space-y-2">
              {getTroubleshootingSteps().map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="text-lg font-medium mb-2">Need Help?</h3>
            <p>
              If you continue to experience issues, please check the{" "}
              <a
                href="https://developer.intuit.com/app/developer/qbo/docs/develop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                QuickBooks API documentation
              </a>{" "}
              or contact our support team for assistance.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/integrations/quickbooks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Integration
          </Button>
          <Button onClick={() => router.push("/integrations/quickbooks")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
