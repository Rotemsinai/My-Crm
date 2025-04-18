"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
import { FileSpreadsheet, Upload, AlertCircle, TableIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { v4 as uuidv4 } from "uuid"
import * as XLSX from "xlsx"

interface ReportUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportUploadDialog({ open, onOpenChange }: ReportUploadDialogProps) {
  // Basic report info
  const [reportName, setReportName] = useState("")
  const [reportType, setReportType] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)

  // Multi-step process state
  const [currentStep, setCurrentStep] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Excel data state
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [sheetNames, setSheetNames] = useState<string[]>([])
  const [selectedSheets, setSelectedSheets] = useState<string[]>([])
  const [tables, setTables] = useState<Record<string, any[][]>>({})
  const [selectedTables, setSelectedTables] = useState<Record<string, number[]>>({})
  const [columnMappings, setColumnMappings] = useState<Record<string, Record<number, string>>>({})
  const [previewData, setPreviewData] = useState<Record<string, any[]>>({})
  const [tableNames, setTableNames] = useState<Record<string, string>>({})
  const [importMode, setImportMode] = useState<"structured" | "raw">("structured")
  const [rawTableData, setRawTableData] = useState<any[][]>([])

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setCurrentStep(1)
      setReportName("")
      setReportType("")
      setFile(null)
      setWorkbook(null)
      setSheetNames([])
      setSelectedSheets([])
      setTables({})
      setSelectedTables({})
      setColumnMappings({})
      setPreviewData({})
      setTableNames({})
      setImportMode("structured")
      setRawTableData([])
      setError(null)
      setSuccess(null)
    }
  }, [open])

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      if (!reportName) {
        // Set default name from file name
        setReportName(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }

      setError(null)

      // Read the Excel file to get sheet names
      try {
        const data = await readExcelFile(selectedFile)
        setWorkbook(data)
        setSheetNames(data.SheetNames)
      } catch (err) {
        console.error("Error reading Excel file:", err)
        setError("Could not parse the Excel file. Please make sure it's a valid Excel file.")
      }
    }
  }

  // Read Excel file and return workbook
  const readExcelFile = (file: File): Promise<XLSX.WorkBook> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: "binary" })
          resolve(workbook)
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

  // Handle sheet selection
  const toggleSheetSelection = (sheetName: string) => {
    setSelectedSheets((prev) => {
      if (prev.includes(sheetName)) {
        return prev.filter((name) => name !== sheetName)
      } else {
        return [...prev, sheetName]
      }
    })
  }

  // Detect tables in selected sheets
  const detectTablesInSheets = () => {
    if (!workbook) return

    const detectedTables: Record<string, any[][]> = {}
    const initialTableNames: Record<string, string> = {}

    selectedSheets.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName]

      // Convert sheet to array of arrays
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

      // For raw table import, store the entire sheet data
      if (importMode === "raw") {
        setRawTableData(data)
        return
      }

      // Find tables in the sheet (consecutive non-empty rows)
      const tables: any[][] = []
      let currentTable: any[] = []
      let emptyRowCount = 0

      data.forEach((row, rowIndex) => {
        // Check if row is empty or contains only empty cells
        const isEmpty = row.length === 0 || row.every((cell) => cell === null || cell === undefined || cell === "")

        if (isEmpty) {
          emptyRowCount++
          // If we have 2+ consecutive empty rows, consider it a table boundary
          if (emptyRowCount >= 2 && currentTable.length > 0) {
            tables.push([...currentTable])
            currentTable = []
          }
        } else {
          emptyRowCount = 0
          currentTable.push({ rowIndex, data: row })
        }
      })

      // Add the last table if it exists
      if (currentTable.length > 0) {
        tables.push([...currentTable])
      }

      detectedTables[sheetName] = tables

      // Set default table names
      tables.forEach((_, tableIndex) => {
        const tableKey = `${sheetName}-${tableIndex}`
        initialTableNames[tableKey] = `${sheetName} - Table ${tableIndex + 1}`
      })
    })

    setTables(detectedTables)
    setTableNames(initialTableNames)

    // Initialize selected tables (default to first table in each sheet)
    const initialSelectedTables: Record<string, number[]> = {}
    Object.keys(detectedTables).forEach((sheetName) => {
      if (detectedTables[sheetName].length > 0) {
        initialSelectedTables[sheetName] = [0] // Select first table by default
      } else {
        initialSelectedTables[sheetName] = []
      }
    })
    setSelectedTables(initialSelectedTables)
  }

  // Toggle table selection
  const toggleTableSelection = (sheetName: string, tableIndex: number) => {
    setSelectedTables((prev) => {
      const sheetTables = prev[sheetName] || []
      if (sheetTables.includes(tableIndex)) {
        return {
          ...prev,
          [sheetName]: sheetTables.filter((idx) => idx !== tableIndex),
        }
      } else {
        return {
          ...prev,
          [sheetName]: [...sheetTables, tableIndex],
        }
      }
    })
  }

  // Update table name
  const updateTableName = (tableKey: string, name: string) => {
    setTableNames((prev) => ({
      ...prev,
      [tableKey]: name,
    }))
  }

  // Generate preview data for selected tables
  const generatePreviewData = () => {
    if (!workbook) return

    if (importMode === "raw") {
      // For raw table import, we already have the data
      return
    }

    const preview: Record<string, any[]> = {}

    // For each selected sheet and table
    Object.entries(selectedTables).forEach(([sheetName, tableIndices]) => {
      if (!tableIndices.length) return

      tableIndices.forEach((tableIndex) => {
        const table = tables[sheetName][tableIndex]
        if (!table || !table.length) return

        // Get header row (first row of the table)
        const headerRow = table[0].data

        // Initialize column mappings if not already set
        if (!columnMappings[`${sheetName}-${tableIndex}`]) {
          const initialMapping: Record<number, string> = {}
          headerRow.forEach((header: string, index: number) => {
            // Try to auto-map columns based on header names
            let mappedField = ""
            const headerStr = String(header).toLowerCase()

            // Common field mappings
            if (headerStr.includes("date") || headerStr.includes("time")) {
              mappedField = "date"
            } else if (headerStr.includes("name") || headerStr.includes("title")) {
              mappedField = "name"
            } else if (headerStr.includes("description") || headerStr.includes("details")) {
              mappedField = "description"
            } else if (headerStr.includes("amount") || headerStr.includes("value") || headerStr.includes("price")) {
              mappedField = "amount"
            } else if (headerStr.includes("quantity") || headerStr.includes("count")) {
              mappedField = "quantity"
            } else if (headerStr.includes("category") || headerStr.includes("type")) {
              mappedField = "category"
            } else if (headerStr.includes("status")) {
              mappedField = "status"
            } else if (headerStr.includes("id") || headerStr.includes("code")) {
              mappedField = "id"
            } else {
              // If no match, use the header name as the field name (converted to lowercase with spaces replaced by underscores)
              mappedField = headerStr.replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")
              if (!mappedField) {
                mappedField = `column_${index}`
              }
            }

            initialMapping[index] = mappedField
          })

          setColumnMappings((prev) => ({
            ...prev,
            [`${sheetName}-${tableIndex}`]: initialMapping,
          }))
        }

        // Create preview data with first few rows
        const previewRows = table.slice(1, Math.min(6, table.length)).map((row) => row.data)
        preview[`${sheetName}-${tableIndex}`] = [headerRow, ...previewRows]
      })
    })

    setPreviewData(preview)
  }

  // Update column mapping
  const updateColumnMapping = (sheetName: string, tableIndex: number, columnIndex: number, fieldType: string) => {
    setColumnMappings((prev) => ({
      ...prev,
      [`${sheetName}-${tableIndex}`]: {
        ...prev[`${sheetName}-${tableIndex}`],
        [columnIndex]: fieldType,
      },
    }))
  }

  // Process the selected data and create a report
  const processSelectedData = () => {
    if (!workbook) return null

    if (importMode === "raw") {
      // For raw table import, return the entire table data
      return {
        reportType: "table",
        tables: [
          {
            name: reportName,
            data: rawTableData,
          },
        ],
      }
    }

    // For structured import, process the data according to the mappings
    const processedData: any = {
      reportType,
      tables: [],
    }

    // Process each selected table
    Object.entries(selectedTables).forEach(([sheetName, tableIndices]) => {
      tableIndices.forEach((tableIndex) => {
        const table = tables[sheetName][tableIndex]
        if (!table || !table.length) return

        const tableKey = `${sheetName}-${tableIndex}`
        const mapping = columnMappings[tableKey] || {}
        const tableName = tableNames[tableKey] || `${sheetName} - Table ${tableIndex + 1}`

        // Get header row and create a processed header row
        const headerRow = table[0].data
        const processedHeaderRow = headerRow.map((_, index) => mapping[index] || `column_${index}`)

        // Process data rows
        const dataRows = table.slice(1)
        const processedDataRows = dataRows.map((row) => {
          const rowData = row.data
          return rowData.map((cell, index) => cell)
        })

        // Add to tables
        processedData.tables.push({
          name: tableName,
          headers: processedHeaderRow,
          data: processedDataRows,
          originalHeaders: headerRow,
          mapping,
        })
      })
    })

    return processedData
  }

  // Handle form submission
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

    // For step 2, validate sheet selection
    if (currentStep === 2 && selectedSheets.length === 0) {
      setError("Please select at least one sheet")
      return
    }

    // For step 3, validate table selection (only for structured import)
    if (currentStep === 3 && importMode === "structured") {
      const hasSelectedTables = Object.values(selectedTables).some((tables) => tables.length > 0)
      if (!hasSelectedTables) {
        setError("Please select at least one table")
        return
      }
    }

    // Handle step transitions
    if (currentStep < 4) {
      setError(null)

      if (currentStep === 1) {
        // Moving to sheet selection
        setCurrentStep(2)
      } else if (currentStep === 2) {
        // Moving to table selection or directly to column mapping for raw import
        detectTablesInSheets()
        if (importMode === "raw") {
          setCurrentStep(4) // Skip table selection for raw import
        } else {
          setCurrentStep(3)
        }
      } else if (currentStep === 3) {
        // Moving to column mapping
        generatePreviewData()
        setCurrentStep(4)
      }

      return
    }

    // Final submission
    setIsUploading(true)
    setError(null)

    try {
      const processedData = processSelectedData()

      if (!processedData) {
        throw new Error("Failed to process data")
      }

      const newReport = {
        id: uuidv4(),
        name: reportName,
        type: importMode === "raw" ? "table" : reportType,
        fileName: file.name,
        uploadDate: new Date().toISOString(),
        data: processedData,
      }

      // Add to localStorage
      const existingReports = JSON.parse(localStorage.getItem("reports") || "[]")
      const updatedReports = [...existingReports, newReport]
      localStorage.setItem("reports", JSON.stringify(updatedReports))

      // Show success message
      setSuccess("Report uploaded successfully!")
      setTimeout(() => {
        setSuccess(null)
        onOpenChange(false)
        // Redirect to the table view
        window.location.href = "/reports/tables"
      }, 2000)
    } catch (error) {
      console.error("Error processing file:", error)
      setError("Error processing file. Please check your selections and try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Report - Step {currentStep} of 4</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Select a file and import mode"}
            {currentStep === 2 && "Select sheets to import"}
            {currentStep === 3 && "Select tables to import"}
            {currentStep === 4 && (importMode === "structured" ? "Map columns to data fields" : "Preview data")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto py-4">
            {/* Step 1: File Selection and Import Mode */}
            {currentStep === 1 && (
              <div className="grid gap-4">
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
                  <Label htmlFor="import-mode" className="col-span-4">
                    Import Mode
                  </Label>
                  <Select value={importMode} onValueChange={(value: "structured" | "raw") => setImportMode(value)}>
                    <SelectTrigger className="col-span-4">
                      <SelectValue placeholder="Select import mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="raw">Raw Table Import (Preserve Original Structure)</SelectItem>
                      <SelectItem value="structured">Structured Import (Map Columns)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {importMode === "structured" && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="report-type" className="col-span-4">
                      Report Type
                    </Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger className="col-span-4">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="financial">Financial Report</SelectItem>
                        <SelectItem value="employee">Employee/Technician Report</SelectItem>
                        <SelectItem value="customer">Customer Report</SelectItem>
                        <SelectItem value="inventory">Inventory Report</SelectItem>
                        <SelectItem value="custom">Custom Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
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
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Sheet Selection */}
            {currentStep === 2 && (
              <div className="grid gap-4">
                <Label className="col-span-4">Select sheets to import (found {sheetNames.length} sheets)</Label>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <div className="space-y-2">
                    {sheetNames.map((sheetName) => (
                      <div key={sheetName} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sheet-${sheetName}`}
                          checked={selectedSheets.includes(sheetName)}
                          onCheckedChange={() => toggleSheetSelection(sheetName)}
                        />
                        <Label htmlFor={`sheet-${sheetName}`} className="cursor-pointer">
                          {sheetName}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Step 3: Table Selection (only for structured import) */}
            {currentStep === 3 && importMode === "structured" && (
              <div className="grid gap-4">
                <Label className="col-span-4">Select tables to import</Label>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  <div className="space-y-6">
                    {selectedSheets.map((sheetName) => (
                      <div key={sheetName} className="space-y-2">
                        <h3 className="font-medium text-sm">{sheetName}</h3>
                        {tables[sheetName] && tables[sheetName].length > 0 ? (
                          <div className="pl-4 space-y-2">
                            {tables[sheetName].map((table, tableIndex) => (
                              <div key={tableIndex} className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`table-${sheetName}-${tableIndex}`}
                                    checked={(selectedTables[sheetName] || []).includes(tableIndex)}
                                    onCheckedChange={() => toggleTableSelection(sheetName, tableIndex)}
                                  />
                                  <Label htmlFor={`table-${sheetName}-${tableIndex}`} className="cursor-pointer">
                                    Table {tableIndex + 1} ({table.length} rows)
                                  </Label>
                                </div>
                                {(selectedTables[sheetName] || []).includes(tableIndex) && (
                                  <div className="pl-6">
                                    <Label htmlFor={`table-name-${sheetName}-${tableIndex}`} className="text-xs mb-1">
                                      Table Name
                                    </Label>
                                    <Input
                                      id={`table-name-${sheetName}-${tableIndex}`}
                                      value={tableNames[`${sheetName}-${tableIndex}`] || ""}
                                      onChange={(e) => updateTableName(`${sheetName}-${tableIndex}`, e.target.value)}
                                      className="h-8 text-sm"
                                      placeholder="Enter a name for this table"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground pl-4">No tables found in this sheet</p>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Step 4: Column Mapping or Data Preview */}
            {currentStep === 4 && (
              <div className="grid gap-4">
                {importMode === "structured" ? (
                  <>
                    <Label className="col-span-4">Map columns to data fields</Label>
                    <ScrollArea className="h-[300px] border rounded-md p-4">
                      <div className="space-y-6">
                        {Object.entries(previewData).map(([tableKey, tableData]) => {
                          const [sheetName, tableIndexStr] = tableKey.split("-")
                          const tableIndex = Number.parseInt(tableIndexStr)

                          return (
                            <div key={tableKey} className="space-y-2">
                              <h3 className="font-medium text-sm">
                                {tableNames[tableKey] || `${sheetName} - Table ${tableIndex + 1}`}
                              </h3>
                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="w-[100px]">Original Column</TableHead>
                                      <TableHead>Field Name</TableHead>
                                      <TableHead>Preview</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {tableData[0].map((header: any, colIndex: number) => (
                                      <TableRow key={colIndex}>
                                        <TableCell>{header || `Column ${colIndex + 1}`}</TableCell>
                                        <TableCell>
                                          <Input
                                            value={columnMappings[tableKey]?.[colIndex] || ""}
                                            onChange={(e) =>
                                              updateColumnMapping(sheetName, tableIndex, colIndex, e.target.value)
                                            }
                                            className="w-full"
                                            placeholder="Enter field name"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <div className="max-w-[200px] truncate">
                                            {tableData.slice(1).map((row: any, i: number) => (
                                              <div key={i} className="text-xs">
                                                {row[colIndex]}
                                              </div>
                                            ))}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </>
                ) : (
                  <>
                    <Label className="col-span-4">Preview Data</Label>
                    <ScrollArea className="h-[300px] border rounded-md p-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <TableIcon className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{reportName}</h3>
                        </div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {rawTableData[0]?.map((header, index) => (
                                  <TableHead key={index}>{header || `Column ${index + 1}`}</TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rawTableData.slice(1, 6).map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                  {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex}>{cell}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Showing preview of first 5 rows. The full table will be imported.
                        </p>
                      </div>
                    </ScrollArea>
                  </>
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="mt-4 bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="pt-4 border-t">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={() => setCurrentStep((prev) => prev - 1)}>
                Back
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : currentStep < 4 ? "Next" : "Import Table"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
