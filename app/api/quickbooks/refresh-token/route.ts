import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { QB_CONFIG } from "@/lib/quickbooks/auth"

export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from the request
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    // Exchange the refresh token for a new access token
    try {
      const tokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${QB_CONFIG.clientId}:${QB_CONFIG.clientSecret}`).toString("base64")}`,
          },
          timeout: 10000, // 10 second timeout
        },
      )

      // Extract the new tokens
      const { access_token, refresh_token, expires_in } = response.data

      // Return the new tokens
      return NextResponse.json({
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresIn: expires_in,
      })
    } catch (error) {
      console.error("Error refreshing QuickBooks token:", error)

      // Determine the appropriate error response
      if (error.response) {
        const status = error.response.status

        if (status === 401 || status === 403) {
          return NextResponse.json(
            {
              error: "Authentication failed. Please reconnect your QuickBooks account.",
            },
            { status: 401 },
          )
        } else if (status === 429) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded. Please try again later.",
            },
            { status: 429 },
          )
        } else if (status >= 500) {
          return NextResponse.json(
            {
              error: "QuickBooks server error. Please try again later.",
            },
            { status: 502 },
          )
        }

        return NextResponse.json(
          {
            error: error.response.data?.message || "Failed to refresh token",
          },
          { status: status },
        )
      } else if (error.request) {
        return NextResponse.json(
          {
            error: "Connection to QuickBooks failed. Please check your internet connection.",
          },
          { status: 503 },
        )
      }

      return NextResponse.json(
        {
          error: "An unexpected error occurred while refreshing the token.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing refresh token request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
