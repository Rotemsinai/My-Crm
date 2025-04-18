"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileSpreadsheet, Upload } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import * as XLSX from "xlsx"

interface AddReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReportAdded: (report: any) => void
}

export function AddReportDialog({ open, onOpenChange, onReportAdded }: AddReportDialogProps) {
  const [reportName, setReportName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      if (!reportName) {
        // Set default name from file name
        setReportName(e.target.files[0].name.replace(/\.[^/.]+$/, ""))
      }
      setError(null)
    }
  }

  const processExcelFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          // Process the data to extract financial information
          const processedData = processFinancialData(jsonData)
          resolve(processedData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => {
        reject(error)
      }

      reader.readAsBinaryString(file)
    })
  }

  const processFinancialData = (data: any[]) => {
    // This function would process the raw Excel data into a structured format
    // For QuickBooks P&L reports, we'd extract categories, amounts, dates, etc.

    // Example structure for processed data
    const processedData = {
      financialData: {
        income: 0,
        expenses: 0,
        netIncome: 0,
        profitMargin: 0,
      },
      categoryBreakdown: [] as { name: string; amount: number; percentage: number }[],
      vendorBreakdown: [] as { name: string; amount: number }[],
      monthlyData: [] as { month: string; income: number; expenses: number; profit: number }[],
    }

    // Mock data processing - in a real app, this would parse the actual Excel data
    // This is just to demonstrate the structure

    // Generate random financial data
    processedData.financialData = {
      income: Math.random() * 100000 + 50000,
      expenses: Math.random() * 70000 + 30000,
      netIncome: 0,
      profitMargin: 0,
    }

    processedData.financialData.netIncome = processedData.financialData.income - processedData.financialData.expenses

    processedData.financialData.profitMargin =
      (processedData.financialData.netIncome / processedData.financialData.income) * 100

    // Generate category breakdown
    const categories = [
      "Materials",
      "Office Supplies",
      "Software",
      "Marketing",
      "Utilities",
      "Rent",
      "Payroll",
      "Travel",
    ]

    categories.forEach((category) => {
      const amount = Math.random() * 10000 + 1000
      processedData.categoryBreakdown.push({
        name: category,
        amount,
        percentage: (amount / processedData.financialData.expenses) * 100,
      })
    })

    // Generate vendor breakdown
    const vendors = [
      "Home Depot",
      "Office Supplies Inc",
      "Tech Solutions",
      "Marketing Agency",
      "Utility Company",
      "Landlord LLC",
    ]

    vendors.forEach((vendor) => {
      processedData.vendorBreakdown.push({
        name: vendor,
        amount: Math.random() * 8000 + 1000,
      })
    })

    // Generate monthly data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    months.forEach((month) => {
      const income = Math.random() * 20000 + 10000
      const expenses = Math.random() * 15000 + 5000
      processedData.monthlyData.push({
        month,
        income,
        expenses,
        profit: income - expenses,
      })
    })

    return processedData
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    if (!reportName.trim()) {
      setError("Please enter a report name")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const processedData = await processExcelFile(file)

      const newReport = {
        id: uuidv4(),
        name: reportName,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        ...processedData,
      }

      // Add to localStorage
      const existingReports = JSON.parse(localStorage.getItem("financialReports") || "[]")
      const updatedReports = [...existingReports, newReport]
      localStorage.setItem("financialReports", JSON.stringify(updatedReports))

      // Call the callback
      onReportAdded(newReport)

      // Reset form and close dialog
      setReportName("")
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Error processing file:", error)
      setError("Error processing file. Please make sure it is a valid Excel file.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Financial Report</DialogTitle>
          <DialogDescription>
            Upload a QuickBooks Profit & Loss report to analyze your financial data.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="report-name" className="col-span-4">
                Report Name
              </Label>
              <Input
                id="report-name"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="col-span-4"
                placeholder="Q1 2023 Financial Report"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file-upload" className="col-span-4">
                Excel File
              </Label>
              <div className="col-span-4">
                <Label
                  htmlFor="file-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-4 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {file ? (
                    <>
                      <FileSpreadsheet className="h-5 w-5 text-green-500" />
                      <span>{file.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Click to upload Excel file</span>
                    </>
                  )}
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
            {error && <div className="text-sm text-red-500">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
