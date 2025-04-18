"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, FileText, BarChart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Mock data for uploaded reports
const uploadedReports = [
  { id: "report-1", name: "April 1-15 P&L", date: "2023-04-16", type: "Profit & Loss", status: "Processed" },
  { id: "report-2", name: "March 16-31 P&L", date: "2023-04-01", type: "Profit & Loss", status: "Processed" },
  { id: "report-3", name: "March 1-15 P&L", date: "2023-03-16", type: "Profit & Loss", status: "Processed" },
  { id: "report-4", name: "February 16-28 P&L", date: "2023-03-01", type: "Profit & Loss", status: "Processed" },
]

export default function UploadsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadType, setUploadType] = useState<"quickbooks" | "other">("quickbooks")
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setUploadSuccess(false)
    setUploadError(null)
  }

  const handleUpload = () => {
    if (!file) {
      setUploadError("Please select a file to upload")
      return
    }

    // Check if file is Excel
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setUploadError("Please upload an Excel file (.xlsx or .xls)")
      return
    }

    setUploading(true)
    setUploadError(null)

    // Simulate upload process
    setTimeout(() => {
      setUploading(false)
      setUploadSuccess(true)

      // In a real app, we would redirect to the analysis page for this specific upload
      // For demo purposes, we'll just reset the form after a delay
      setTimeout(() => {
        router.push(`/uploads/${Date.now()}`)
      }, 1500)

      setFile(null)

      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    }, 2000)
  }

  const viewReport = (reportId: string) => {
    router.push(`/uploads/${reportId}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Reports</h2>
        <p className="text-muted-foreground">Upload financial reports for analysis</p>
      </div>

      <Tabs defaultValue="quickbooks" onValueChange={(value) => setUploadType(value as "quickbooks" | "other")}>
        <TabsList>
          <TabsTrigger value="quickbooks">QuickBooks P&L</TabsTrigger>
          <TabsTrigger value="other">Other Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="quickbooks">
          <Card>
            <CardHeader>
              <CardTitle>Upload QuickBooks Profit & Loss Report</CardTitle>
              <CardDescription>
                Upload Excel (.xlsx) files exported from QuickBooks for detailed financial analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="file-upload">Excel File</Label>
                      <Input id="file-upload" type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
                    </div>

                    {file && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        <span>{file.name}</span>
                        <span className="text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span>
                      </div>
                    )}

                    {uploadError && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}

                    {uploadSuccess && (
                      <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>
                          ✅ Report Imported: {file ? file.name.replace(".xlsx", "").replace(".xls", "") : "Report"}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="bg-mrs-blue hover:bg-mrs-darkBlue mt-4"
                    >
                      {uploading ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Report
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">QuickBooks P&L Analysis Features</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <BarChart className="h-5 w-5 text-mrs-blue flex-shrink-0 mt-0.5" />
                        <span>Automatic income and expense categorization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart className="h-5 w-5 text-mrs-blue flex-shrink-0 mt-0.5" />
                        <span>Trend analysis across multiple periods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart className="h-5 w-5 text-mrs-blue flex-shrink-0 mt-0.5" />
                        <span>Profit margin and growth calculations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart className="h-5 w-5 text-mrs-blue flex-shrink-0 mt-0.5" />
                        <span>Expense breakdown by category</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <BarChart className="h-5 w-5 text-mrs-blue flex-shrink-0 mt-0.5" />
                        <span>Comparative analysis with previous periods</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="other">
          <Card>
            <CardHeader>
              <CardTitle>Upload Other Financial Reports</CardTitle>
              <CardDescription>Upload other financial documents for storage and reference</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="other-file-upload">File</Label>
                  <Input id="other-file-upload" type="file" onChange={handleFileChange} />
                </div>

                {file && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-muted-foreground">({(file.size / 1024).toFixed(2)} KB)</span>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="bg-mrs-blue hover:bg-mrs-darkBlue"
                >
                  {uploading ? (
                    <>Uploading...</>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Previously uploaded financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <span>{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>{report.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => viewReport(report.id)}>
                      View Analysis
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
