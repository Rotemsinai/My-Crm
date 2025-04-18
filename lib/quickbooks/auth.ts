// QuickBooks OAuth configuration
export const QB_CONFIG = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID || "",
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET || "",
  redirectUri: process.env.QUICKBOOKS_REDIRECT_URI || "https://your-domain.com/api/quickbooks/auth/callback", // Default value
  environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
  scopes: ["com.intuit.quickbooks.accounting", "com.intuit.quickbooks.payment"],
}

// Generate the QuickBooks authorization URL
export function getQuickBooksAuthUrl() {
  const baseUrl = "https://appcenter.intuit.com/connect/oauth2"

  const params = new URLSearchParams({
    client_id: QB_CONFIG.clientId,
    response_type: "code",
    scope: QB_CONFIG.scopes.join(" "),
    redirect_uri: QB_CONFIG.redirectUri,
    state: generateRandomState(),
  })

  return `${baseUrl}?${params.toString()}`
}

// Generate a random state for OAuth security
function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Store the OAuth state in localStorage for verification
export function storeOAuthState(state: string) {
  localStorage.setItem("qb_oauth_state", state)
}

// Verify the returned OAuth state
export function verifyOAuthState(state: string) {
  const storedState = localStorage.getItem("qb_oauth_state")
  return state === storedState
}

// Clear the OAuth state
export function clearOAuthState() {
  localStorage.removeItem("qb_oauth_state")
}
