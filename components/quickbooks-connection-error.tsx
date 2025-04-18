"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { QuickBooksErrorType } from "@/lib/quickbooks/quickbooks-api"
import { AlertCircle, WifiOff, Lock, AlertTriangle, Clock, HelpCircle } from "lucide-react"

interface QuickBooksConnectionErrorProps {
  errorType: QuickBooksErrorType
  errorMessage?: string
  onRetry?: () => void
  onReconnect?: () => void
}

export function QuickBooksConnectionError({
  errorType,
  errorMessage,
  onRetry,
  onReconnect,
}: QuickBooksConnectionErrorProps) {
  // Get error icon based on error type
  const getErrorIcon = () => {
    switch (errorType) {
      case QuickBooksErrorType.AUTHENTICATION:
        return <Lock className="h-5 w-5 text-red-600" />
      case QuickBooksErrorType.CONNECTION:
        return <WifiOff className="h-5 w-5 text-red-600" />
      case QuickBooksErrorType.RATE_LIMIT:
        return <Clock className="h-5 w-5 text-red-600" />
      case QuickBooksErrorType.SERVER_ERROR:
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />
    }
  }

  // Get error title based on error type
  const getErrorTitle = () => {
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
  const getErrorHelp = () => {
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

  // Get recommended action based on error type
  const getRecommendedAction = () => {
    switch (errorType) {
      case QuickBooksErrorType.AUTHENTICATION:
        return "Reconnect your QuickBooks account"
      case QuickBooksErrorType.CONNECTION:
        return "Check your internet connection and try again"
      case QuickBooksErrorType.RATE_LIMIT:
        return "Wait a few minutes and try again"
      case QuickBooksErrorType.SERVER_ERROR:
        return "Try again later"
      default:
        return "Try reconnecting your account"
    }
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-red-50 text-red-800 border-red-200">
        {getErrorIcon()}
        <AlertTitle>{getErrorTitle()}</AlertTitle>
        <AlertDescription>{errorMessage || getErrorHelp()}</AlertDescription>
      </Alert>

      <div className="rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium mb-2">Recommended Action</h3>
            <p className="mb-4">{getRecommendedAction()}</p>

            <div className="flex flex-wrap gap-2">
              {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  Try Again
                </Button>
              )}

              {onReconnect && <Button onClick={onReconnect}>Reconnect QuickBooks</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
