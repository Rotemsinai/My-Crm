export enum QuickBooksErrorType {
  AUTHENTICATION = "authentication",
  CONNECTION = "connection",
  RATE_LIMIT = "rate_limit",
  SERVER_ERROR = "server_error",
  INVALID_REQUEST = "invalid_request",
  UNKNOWN = "unknown",
}

export interface QuickBooksError {
  type: QuickBooksErrorType
  message: string
  details?: any
  statusCode?: number
}

export function handleQuickBooksError(error: any): QuickBooksError {
  console.error("QuickBooks API Error:", error)

  // Default error
  const quickBooksError: QuickBooksError = {
    type: QuickBooksErrorType.UNKNOWN,
    message: "An unknown error occurred with the QuickBooks API",
  }

  // Check if it's an axios error with response
  if (error.response) {
    const { status, data } = error.response

    // Store the status code
    quickBooksError.statusCode = status
    quickBooksError.details = data

    // Handle different status codes
    if (status === 401 || status === 403) {
      quickBooksError.type = QuickBooksErrorType.AUTHENTICATION
      quickBooksError.message = "Authentication failed. Please reconnect your QuickBooks account."
    } else if (status === 429) {
      quickBooksError.type = QuickBooksErrorType.RATE_LIMIT
      quickBooksError.message = "Rate limit exceeded. Please try again later."
    } else if (status >= 500) {
      quickBooksError.type = QuickBooksErrorType.SERVER_ERROR
      quickBooksError.message = "QuickBooks servers are experiencing issues. Please try again later."
    } else if (status === 400) {
      quickBooksError.type = QuickBooksErrorType.INVALID_REQUEST
      quickBooksError.message = "Invalid request to QuickBooks API. Please check your parameters."
    }

    // Check for specific error messages in the response
    if (data && data.error) {
      if (data.error === "invalid_client") {
        quickBooksError.type = QuickBooksErrorType.AUTHENTICATION
        quickBooksError.message = "Invalid client credentials. Please check your Client ID and Secret."
      } else if (data.error === "invalid_grant") {
        quickBooksError.type = QuickBooksErrorType.AUTHENTICATION
        quickBooksError.message = "Invalid or expired authorization. Please reconnect your QuickBooks account."
      }
    }
  } else if (error.request) {
    // Request was made but no response received
    quickBooksError.type = QuickBooksErrorType.CONNECTION
    quickBooksError.message = "Could not connect to QuickBooks. Please check your internet connection."
  }

  return quickBooksError
}
