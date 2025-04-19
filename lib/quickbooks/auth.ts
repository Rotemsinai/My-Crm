// Generate a random state for OAuth security
export function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Generate the QuickBooks authorization URL
export function getQuickBooksAuthUrl() {
  // Debug environment variables
  console.log("Environment Variables Check:")
  console.log("- NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID:", process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID)
  console.log("- QUICKBOOKS_REDIRECT_URI:", process.env.QUICKBOOKS_REDIRECT_URI)

  const baseUrl = "https://appcenter.intuit.com/connect/oauth2"

  // Use the public environment variable for client ID
  const clientId = process.env.NEXT_PUBLIC_QUICKBOOKS_CLIENT_ID || ""
  // Use the server environment variable for redirect URI
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI || ""
  const scopes = ["com.intuit.quickbooks.accounting", "com.intuit.quickbooks.payment"]

  if (!clientId) {
    console.error("CRITICAL ERROR: No QuickBooks Client ID available!")
    return "#error-no-client-id"
  }

  const state = generateRandomState()
  if (typeof window !== "undefined") {
    localStorage.setItem("qb_oauth_state", state)
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: scopes.join(" "),
    redirect_uri: redirectUri,
    state: state,
  })

  return `${baseUrl}?${params.toString()}`
}

// Verify the returned OAuth state
export function verifyOAuthState(state: string) {
  if (typeof window !== "undefined") {
    const storedState = localStorage.getItem("qb_oauth_state")
    return state === storedState
  }
  return false
}

// Clear the OAuth state
export function clearOAuthState() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("qb_oauth_state")
  }
}
