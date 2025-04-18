import type { QuickBooksAPI } from "./quickbooks-api"

// Interface for sync options
export interface SyncOptions {
  syncAccounts?: boolean
  syncCustomers?: boolean
  syncInvoices?: boolean
  syncBills?: boolean
  syncPayments?: boolean
  syncReports?: boolean
  startDate?: string
  endDate?: string
}

// Data sync service
export class QuickBooksDataSync {
  private api: QuickBooksAPI

  constructor(api: QuickBooksAPI) {
    this.api = api
  }

  // Sync all selected data from QuickBooks
  async syncData(options: SyncOptions) {
    const results: Record<string, any> = {}

    try {
      // Sync accounts
      if (options.syncAccounts) {
        console.log("Syncing accounts...")
        const accountsData = await this.api.getAccounts()
        results.accounts = this.processAccounts(accountsData)
      }

      // Sync customers
      if (options.syncCustomers) {
        console.log("Syncing customers...")
        const customersData = await this.api.getCustomers()
        results.customers = this.processCustomers(customersData)
      }

      // Sync invoices
      if (options.syncInvoices) {
        console.log("Syncing invoices...")
        const invoicesData = await this.api.getInvoices()
        results.invoices = this.processInvoices(invoicesData)
      }

      // Sync bills
      if (options.syncBills) {
        console.log("Syncing bills...")
        const billsData = await this.api.getBills()
        results.bills = this.processBills(billsData)
      }

      // Sync payments
      if (options.syncPayments) {
        console.log("Syncing payments...")
        const paymentsData = await this.api.getPayments()
        results.payments = this.processPayments(paymentsData)
      }

      // Sync reports
      if (options.syncReports && options.startDate && options.endDate) {
        console.log("Syncing reports...")

        // Profit and Loss
        const plReport = await this.api.getProfitAndLossReport(options.startDate, options.endDate)
        results.profitAndLoss = this.processReport(plReport)

        // Balance Sheet
        const bsReport = await this.api.getBalanceSheet(options.endDate)
        results.balanceSheet = this.processReport(bsReport)

        // Cash Flow
        const cfReport = await this.api.getCashFlowStatement(options.startDate, options.endDate)
        results.cashFlow = this.processReport(cfReport)
      }

      // Store the synced data
      await this.storeData(results)

      return {
        success: true,
        data: results,
      }
    } catch (error) {
      console.error("Error syncing QuickBooks data:", error)
      return {
        success: false,
        error: "Failed to sync data from QuickBooks",
      }
    }
  }

  // Process accounts data
  private processAccounts(data: any) {
    // Extract and transform accounts data
    if (!data || !data.QueryResponse || !data.QueryResponse.Account) {
      return []
    }

    return data.QueryResponse.Account.map((account: any) => ({
      id: account.Id,
      name: account.Name,
      type: account.AccountType,
      subType: account.AccountSubType,
      balance: account.CurrentBalance,
      isActive: account.Active,
    }))
  }

  // Process customers data
  private processCustomers(data: any) {
    // Extract and transform customers data
    if (!data || !data.QueryResponse || !data.QueryResponse.Customer) {
      return []
    }

    return data.QueryResponse.Customer.map((customer: any) => ({
      id: customer.Id,
      displayName: customer.DisplayName,
      companyName: customer.CompanyName,
      email: customer.PrimaryEmailAddr?.Address,
      phone: customer.PrimaryPhone?.FreeFormNumber,
      balance: customer.Balance,
      isActive: customer.Active,
    }))
  }

  // Process invoices data
  private processInvoices(data: any) {
    // Extract and transform invoices data
    if (!data || !data.QueryResponse || !data.QueryResponse.Invoice) {
      return []
    }

    return data.QueryResponse.Invoice.map((invoice: any) => ({
      id: invoice.Id,
      customerId: invoice.CustomerRef?.value,
      customerName: invoice.CustomerRef?.name,
      date: invoice.TxnDate,
      dueDate: invoice.DueDate,
      total: invoice.TotalAmt,
      balance: invoice.Balance,
      status: this.getInvoiceStatus(invoice),
      lineItems: (invoice.Line || []).map((line: any) => ({
        description: line.Description,
        amount: line.Amount,
        quantity: line.Quantity,
        unitPrice: line.UnitPrice,
      })),
    }))
  }

  // Get invoice status
  private getInvoiceStatus(invoice: any) {
    if (invoice.Balance === 0) return "Paid"
    if (invoice.Balance === invoice.TotalAmt) return "Unpaid"
    return "Partial"
  }

  // Process bills data
  private processBills(data: any) {
    // Extract and transform bills data
    if (!data || !data.QueryResponse || !data.QueryResponse.Bill) {
      return []
    }

    return data.QueryResponse.Bill.map((bill: any) => ({
      id: bill.Id,
      vendorId: bill.VendorRef?.value,
      vendorName: bill.VendorRef?.name,
      date: bill.TxnDate,
      dueDate: bill.DueDate,
      total: bill.TotalAmt,
      balance: bill.Balance,
      status: bill.Balance === 0 ? "Paid" : "Unpaid",
      lineItems: (bill.Line || []).map((line: any) => ({
        description: line.Description,
        amount: line.Amount,
      })),
    }))
  }

  // Process payments data
  private processPayments(data: any) {
    // Extract and transform payments data
    if (!data || !data.QueryResponse || !data.QueryResponse.Payment) {
      return []
    }

    return data.QueryResponse.Payment.map((payment: any) => ({
      id: payment.Id,
      customerId: payment.CustomerRef?.value,
      customerName: payment.CustomerRef?.name,
      date: payment.TxnDate,
      amount: payment.TotalAmt,
      paymentMethod: payment.PaymentMethodRef?.name,
    }))
  }

  // Process report data
  private processReport(data: any) {
    // For reports, we'll just return the raw data for now
    // In a real implementation, you would transform this into a more usable format
    return data
  }

  // Store the synced data
  private async storeData(data: Record<string, any>) {
    // In a real implementation, you would store this data in your database
    // For this demo, we'll store it in localStorage
    localStorage.setItem(
      "quickbooks_data",
      JSON.stringify({
        syncedAt: new Date().toISOString(),
        data,
      }),
    )

    console.log("QuickBooks data stored successfully")
  }
}
