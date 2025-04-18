import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { QB_CONFIG } from "@/lib/quickbooks/auth"
import { handleQuickBooksError } from "@/lib/quickbooks/error-handling"

export async function GET(request: NextRequest) {
  // Get the authorization code and state from the URL
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const realmId = searchParams.get("realmId")

  // Validate the state parameter to prevent CSRF attacks
  // In a real app, you would verify this against a stored state
  if (!code || !state || !realmId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    // Exchange the authorization code for tokens
    const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
    const tokenResponse = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: QB_CONFIG.redirectUri,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${QB_CONFIG.clientId}:${QB_CONFIG.clientSecret}`).toString("base64")}`,
        },
      },
    )

    // Extract the tokens
    const { access_token, refresh_token, expires_in } = tokenResponse.data

    // Store the tokens securely (in a real app, you would store these in a database)
    // For this demo, we'll store them in cookies or localStorage
    const authData = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresIn: expires_in,
      realmId,
    }

    // Store the auth data in a secure cookie
    const response = NextResponse.redirect(new URL("/integrations/quickbooks/connected", request.url))
    response.cookies.set("qb_auth_data", JSON.stringify(authData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error exchanging QuickBooks authorization code:", error)
    const qbError = handleQuickBooksError(error)

    // Redirect to an error page with the error details
    const errorUrl = new URL("/integrations/quickbooks/error", request.url)
    errorUrl.searchParams.set("type", qbError.type)
    errorUrl.searchParams.set("message", qbError.message)

    return NextResponse.redirect(errorUrl)
  }
}
