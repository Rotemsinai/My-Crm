import axios from "axios"
import { QB_CONFIG } from "./auth"
import { handleQuickBooksError, QuickBooksErrorType } from "./error-handling"

export { QuickBooksErrorType }

export class QuickBooksAPI {
  private accessToken: string
  private refreshToken: string
  private realmId: string
  private tokenExpiresAt: number
  private baseUrl: string

  constructor(authData: {
    accessToken: string
    refreshToken: string
    realmId: string
    expiresIn?: number
  }) {
    this.accessToken = authData.accessToken
    this.refreshToken = authData.refreshToken
    this.realmId = authData.realmId
    this.tokenExpiresAt = authData.expiresIn ? Date.now() + authData.expiresIn * 1000 : Date.now() + 3600 * 1000 // Default 1 hour
    this.baseUrl =
      QB_CONFIG.environment === "production"
        ? "https://quickbooks.api.intuit.com/v3"
        : "https://sandbox-quickbooks.api.intuit.com/v3"
  }

  // Test the connection to QuickBooks
  async testConnection() {
    try {
      // Try to get company info as a simple test
      await this.getCompanyInfo()
      return { success: true }
    } catch (error) {
      const qbError = handleQuickBooksError(error)
      return {
        success: false,
        error: qbError,
      }
    }
  }

  // Get company information
  async getCompanyInfo() {
    try {
      await this.ensureValidToken()
      const response = await axios.get(`${this.baseUrl}/company/${this.realmId}/companyinfo/${this.realmId}`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get accounts
  async getAccounts() {
    try {
      await this.ensureValidToken()
      const response = await axios.get(`${this.baseUrl}/company/${this.realmId}/query?query=select * from Account`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get customers
  async getCustomers() {
    try {
      await this.ensureValidToken()
      const response = await axios.get(`${this.baseUrl}/company/${this.realmId}/query?query=select * from Customer`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get invoices
  async getInvoices(startDate?: string, endDate?: string) {
    try {
      await this.ensureValidToken()
      let query = "select * from Invoice"

      if (startDate || endDate) {
        query += " WHERE "
        if (startDate) {
          query += `TxnDate >= '${startDate}'`
        }
        if (startDate && endDate) {
          query += " AND "
        }
        if (endDate) {
          query += `TxnDate <= '${endDate}'`
        }
      }

      const response = await axios.get(
        `${this.baseUrl}/company/${this.realmId}/query?query=${encodeURIComponent(query)}`,
        {
          headers: this.getHeaders(),
        },
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get bills
  async getBills(startDate?: string, endDate?: string) {
    try {
      await this.ensureValidToken()
      let query = "select * from Bill"

      if (startDate || endDate) {
        query += " WHERE "
        if (startDate) {
          query += `TxnDate >= '${startDate}'`
        }
        if (startDate && endDate) {
          query += " AND "
        }
        if (endDate) {
          query += `TxnDate <= '${endDate}'`
        }
      }

      const response = await axios.get(
        `${this.baseUrl}/company/${this.realmId}/query?query=${encodeURIComponent(query)}`,
        {
          headers: this.getHeaders(),
        },
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get payments
  async getPayments(startDate?: string, endDate?: string) {
    try {
      await this.ensureValidToken()
      let query = "select * from Payment"

      if (startDate || endDate) {
        query += " WHERE "
        if (startDate) {
          query += `TxnDate >= '${startDate}'`
        }
        if (startDate && endDate) {
          query += " AND "
        }
        if (endDate) {
          query += `TxnDate <= '${endDate}'`
        }
      }

      const response = await axios.get(
        `${this.baseUrl}/company/${this.realmId}/query?query=${encodeURIComponent(query)}`,
        {
          headers: this.getHeaders(),
        },
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get profit and loss report
  async getProfitAndLossReport(startDate: string, endDate: string) {
    try {
      await this.ensureValidToken()
      const response = await axios.get(
        `${this.baseUrl}/company/${this.realmId}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: this.getHeaders(),
        },
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get balance sheet report
  async getBalanceSheetReport(date: string) {
    try {
      await this.ensureValidToken()
      const response = await axios.get(`${this.baseUrl}/company/${this.realmId}/reports/BalanceSheet?as_of=${date}`, {
        headers: this.getHeaders(),
      })
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Get cash flow report
  async getCashFlowReport(startDate: string, endDate: string) {
    try {
      await this.ensureValidToken()
      const response = await axios.get(
        `${this.baseUrl}/company/${this.realmId}/reports/CashFlow?start_date=${startDate}&end_date=${endDate}`,
        {
          headers: this.getHeaders(),
        },
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  // Ensure we have a valid token
  private async ensureValidToken() {
    if (Date.now() >= this.tokenExpiresAt - 300000) {
      // Refresh if less than 5 minutes left
      await this.refreshAccessToken()
    }
  }

  // Refresh the access token
  private async refreshAccessToken() {
    try {
      const response = await axios.post(
        "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${QB_CONFIG.clientId}:${QB_CONFIG.clientSecret}`).toString("base64")}`,
          },
        },
      )

      // Update tokens
      this.accessToken = response.data.access_token
      this.refreshToken = response.data.refresh_token || this.refreshToken
      this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000

      // Update stored auth data
      const authData = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresIn: response.data.expires_in,
        realmId: this.realmId,
      }
      localStorage.setItem("qb_auth_data", JSON.stringify(authData))

      return true
    } catch (error) {
      console.error("Error refreshing QuickBooks token:", error)
      throw error
    }
  }

  // Get headers for API requests
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    }
  }
}
