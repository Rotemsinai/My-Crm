"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import {
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ChevronDown,
  Upload,
  RefreshCw,
  Settings2,
  MoreHorizontal,
  Columns,
  Maximize,
  Minimize,
  ArrowDown,
  ArrowUp,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportUploadDialog } from "@/components/report-upload-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

// Formula parser library (simplified version)
const evaluateFormula = (formula: string, rowData: any, allData: any[]): any => {
  try {
    // Remove the = sign at the beginning
    const expression = formula.startsWith("=") ? formula.substring(1) : formula

    // Replace cell references (e.g., A1, B2) with actual values
    const cellRefRegex = /([A-Z]+)(\d+)/g
    const processedExpression = expression.replace(cellRefRegex, (match, column, row) => {
      const colIndex = column.charCodeAt(0) - 65 // A=0, B=1, etc.
      const rowIndex = Number.parseInt(row) - 1

      if (rowIndex >= 0 && rowIndex < allData.length && colIndex >= 0 && colIndex < allData[rowIndex].length) {
        return allData[rowIndex][colIndex]
      }
      return "0"
    })

    // Replace SUM, AVERAGE, etc. with JavaScript equivalents
    // This is a simplified version - a real implementation would be more robust
    const withFunctions = processedExpression
      .replace(/SUM$(.*?)$/gi, (match, range) => {
        const [start, end] = range.split(":")
        // Simplified implementation - would need to handle ranges properly
        return "0"
      })
      .replace(/AVERAGE$(.*?)$/gi, (match, range) => {
        // Simplified implementation
        return "0"
      })

    // Evaluate the expression
    // Note: eval is used for simplicity, but a proper formula parser would use a safer approach
    return eval(withFunctions)
  } catch (error) {
    console.error("Formula evaluation error:", error)
    return "#ERROR"
  }
}

// Check if a value is a formula
const isFormula = (value: string): boolean => {
  return typeof value === "string" && value.startsWith("=")
}

// Format cell value based on type
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return ""

  if (typeof value === "number") {
    // Format numbers with commas and up to 2 decimal places
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }

  if (value instanceof Date) {
    return value.toLocaleDateString()
  }

  return String(value)
}

// Interface for hierarchical data
interface HierarchicalRow {
  id: string
  parentId: string | null
  level: number
  isExpanded: boolean
  isVisible: boolean
  isCategory: boolean
  originalIndex: number
  data: any[]
}

// Create sample data for testing
const createSampleData = () => {
  const headers = ["Category", "Q1", "Q2", "Q3", "Q4", "Total"]
  const data = [
    headers,
    ["Revenue", 10000, 12000, 15000, 18000, 55000],
    ["  Product A", 5000, 6000, 7500, 9000, 27500],
    ["  Product B", 3000, 3500, 4500, 5000, 16000],
    ["  Product C", 2000, 2500, 3000, 4000, 11500],
    ["Expenses", 8000, 8500, 9000, 9500, 35000],
    ["  Salaries", 5000, 5200, 5400, 5600, 21200],
    ["  Marketing", 1500, 1800, 2000, 2200, 7500],
    ["  Operations", 1500, 1500, 1600, 1700, 6300],
    ["Profit", 2000, 3500, 6000, 8500, 20000],
  ]
  return data
}

export default function TablesPage() {
  const [reports, setReports] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [originalData, setOriginalData] = useState<any[]>([])
  const [editableData, setEditableData] = useState<any[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })
  const [hierarchicalData, setHierarchicalData] = useState<HierarchicalRow[]>([])
  const [visibleColumns, setVisibleColumns] = useState<number[]>([])
  const [hasHierarchy, setHasHierarchy] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [hasFormulas, setHasFormulas] = useState(false)
  const [formulaMap, setFormulaMap] = useState<Record<string, string>>({})
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [summaryData, setSummaryData] = useState<Record<string, number>>({})
  const [selectedTab, setSelectedTab] = useState("data")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(100)
  const [totalPages, setTotalPages] = useState(1)
  const [visibleRows, setVisibleRows] = useState<any[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [columnWidths, setColumnWidths] = useState<Record<number, number>>({})
  const [resizingColumn, setResizingColumn] = useState<number | null>(null)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const [tableView, setTableView] = useState<"card" | "table">("table")
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [pinnedColumns, setPinnedColumns] = useState<number[]>([0]) // First column is pinned by default
  const [columnOrder, setColumnOrder] = useState<number[]>([])
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [useSampleData, setUseSampleData] = useState(false)

  // Refs for scrolling and resizing
  const filterScrollAreaRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Load reports from localStorage
  useEffect(() => {
    try {
      const storedReports = JSON.parse(localStorage.getItem("reports") || "[]")
      // Filter for table reports only
      const tableReports = storedReports.filter(
        (report: any) =>
          report.type === "table" || (report.data && report.data.tables && report.data.tables.length > 0),
      )

      console.log("Loaded reports:", tableReports)
      setReports(tableReports)

      if (tableReports.length > 0) {
        setSelectedReport(tableReports[0].id)
      } else {
        // If no reports, use sample data
        setUseSampleData(true)
      }
    } catch (error) {
      console.error("Error loading reports:", error)
      setUseSampleData(true)
    }
  }, [])

  // Get the selected report data
  const getSelectedReportData = () => {
    if (!selectedReport) return null
    return reports.find((report) => report.id === selectedReport)
  }

  // Get tables from the selected report
  const getTablesFromReport = () => {
    if (useSampleData) {
      return [{ name: "Sample Financial Data", data: createSampleData() }]
    }

    const report = getSelectedReportData()
    if (!report) return []

    if (report.type === "table") {
      return [{ name: report.name, data: report.data.tables[0].data }]
    } else if (report.data && report.data.tables) {
      return report.data.tables
    }

    return []
  }

  // Initialize data when report changes or sample data is used
  useEffect(() => {
    const tables = getTablesFromReport()
    if (tables.length === 0) {
      setOriginalData([])
      setEditableData([])
      setFilteredData([])
      setHierarchicalData([])
      setVisibleColumns([])
      setHasHierarchy(false)
      setHasFormulas(false)
      setFormulaMap({})
      setSummaryData({})
      setExpandedCategories(new Set())
      setColumnWidths({})
      setColumnOrder([])
      setDataLoaded(false)
      return
    }

    // Get the first table for now
    const selectedTable = tables[0]
    if (!selectedTable) {
      setOriginalData([])
      setEditableData([])
      setFilteredData([])
      setHierarchicalData([])
      setVisibleColumns([])
      setHasHierarchy(false)
      setHasFormulas(false)
      setFormulaMap({})
      setSummaryData({})
      setExpandedCategories(new Set())
      setColumnWidths({})
      setColumnOrder([])
      setDataLoaded(false)
      return
    }

    const data = selectedTable.data
    console.log("Table data:", data)

    // Initialize visible columns (all columns are visible by default)
    if (data[0]) {
      const allColumns = Array.from({ length: data[0].length }, (_, i) => i)
      setVisibleColumns(allColumns)
      setColumnOrder(allColumns)
    }

    // Initialize column widths
    const initialColumnWidths: Record<number, number> = {}
    if (data[0]) {
      data[0].forEach((_, index) => {
        // Set default column width based on column index
        initialColumnWidths[index] = index === 0 ? 250 : 150
      })
    }
    setColumnWidths(initialColumnWidths)

    // Check for formulas in the data
    let hasFormulasInData = false
    const formulas: Record<string, string> = {}

    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (isFormula(cell)) {
          hasFormulasInData = true
          formulas[`${rowIndex}-${colIndex}`] = cell
        }
      })
    })

    setHasFormulas(hasFormulasInData)
    setFormulaMap(formulas)

    // Detect if the data has a hierarchical structure (like a P&L statement)
    // We'll look for patterns like indentation or category markers
    let hierarchyDetected = false
    const hierarchicalRows: HierarchicalRow[] = []
    const newExpandedCategories = new Set<string>()

    // Check if the first column might contain categories
    if (data.length > 1) {
      const possibleCategories = new Set<string>()
      const categoryLevels = new Map<string, number>()

      // First pass: identify potential categories and their levels
      data.slice(1).forEach((row, idx) => {
        const firstCell = String(row[0] || "")

        // Check for indentation (spaces at the beginning)
        const leadingSpaces = firstCell.match(/^(\s+)/) ? firstCell.match(/^(\s+)/)![0].length : 0
        const level = Math.floor(leadingSpaces / 2)

        // Check for category markers like "Total", "Subtotal", etc.
        const isCategoryMarker = /total|subtotal|sum|income|expense|revenue|cost|profit/i.test(firstCell)

        if (isCategoryMarker || level > 0) {
          hierarchyDetected = true
          possibleCategories.add(firstCell.trim())
          categoryLevels.set(firstCell.trim(), level)
        }
      })

      // Second pass: build the hierarchical structure
      if (hierarchyDetected) {
        const currentParentStack: string[] = []

        data.forEach((row, idx) => {
          const firstCell = String(row[0] || "")
          const trimmedCell = firstCell.trim()
          const leadingSpaces = firstCell.match(/^(\s+)/) ? firstCell.match(/^(\s+)/)![0].length : 0
          const level = Math.floor(leadingSpaces / 2)

          // Determine if this is a category
          const isCategory = idx === 0 || possibleCategories.has(trimmedCell) || level > 0

          // Update parent stack based on level
          while (currentParentStack.length > level) {
            currentParentStack.pop()
          }

          const parentId = currentParentStack.length > 0 ? currentParentStack[currentParentStack.length - 1] : null

          // Create hierarchical row
          const rowId = `row-${idx}`
          const hierarchicalRow: HierarchicalRow = {
            id: rowId,
            parentId,
            level,
            isExpanded: true,
            isVisible: true,
            isCategory,
            originalIndex: idx,
            data: row,
          }

          hierarchicalRows.push(hierarchicalRow)

          // Add to expanded categories by default
          if (isCategory) {
            newExpandedCategories.add(rowId)
            currentParentStack[level] = rowId
          }
        })
      }
    }

    setHasHierarchy(hierarchyDetected)
    setHierarchicalData(hierarchyDetected ? hierarchicalRows : [])
    setExpandedCategories(newExpandedCategories)

    // Calculate summary data for main categories
    if (hierarchyDetected) {
      calculateSummaryData(hierarchicalRows, data[0])
    }

    setOriginalData(data)
    setEditableData(JSON.parse(JSON.stringify(data))) // Deep copy
    applyFiltersAndSort(data)
    setCurrentPage(1)
    setDataLoaded(true)
  }, [selectedReport, useSampleData])

  // Calculate summary data for main categories
  const calculateSummaryData = (hierarchicalRows: HierarchicalRow[], headers: any[]) => {
    const summary: Record<string, number> = {}

    // Find columns that might contain numeric data
    const numericColumns: number[] = []

    hierarchicalRows.slice(1).forEach((row) => {
      row.data.forEach((cell, index) => {
        if (index > 0 && typeof cell === "number") {
          numericColumns.push(index)
        }
      })
    })

    // Get unique numeric columns
    const uniqueNumericColumns = [...new Set(numericColumns)]

    // Calculate totals for main categories (level 0)
    hierarchicalRows
      .filter((row) => row.level === 0 && row.isCategory && row.originalIndex > 0)
      .forEach((category) => {
        const categoryName = String(category.data[0]).trim()

        uniqueNumericColumns.forEach((colIndex) => {
          const columnName = headers[colIndex]
          const key = `${categoryName}-${columnName}`

          // Sum all values for this category
          summary[key] = hierarchicalRows
            .filter((row) => row.parentId === category.id || row.id === category.id)
            .reduce((sum, row) => {
              const value = row.data[colIndex]
              return sum + (typeof value === "number" ? value : 0)
            }, 0)
        })
      })

    setSummaryData(summary)
  }

  // Apply filters and sorting to the data
  const applyFiltersAndSort = (data: any[]) => {
    if (!data || data.length === 0) {
      setFilteredData([])
      setVisibleRows([])
      setTotalPages(1)
      return
    }

    let processedData = [...data]

    // Apply search filter
    if (searchTerm) {
      processedData = processedData.filter((row, rowIndex) => {
        if (rowIndex === 0) return true // Keep header row
        return row.some((cell: any) => String(cell).toLowerCase().includes(searchTerm.toLowerCase()))
      })
    }

    // Apply active filters
    Object.entries(activeFilters).forEach(([column, filterValue]) => {
      const columnIndex = Number.parseInt(column)
      if (!isNaN(columnIndex)) {
        processedData = processedData.filter((row, rowIndex) => {
          if (rowIndex === 0) return true // Keep header row

          const cellValue = row[columnIndex]

          if (Array.isArray(filterValue)) {
            // Multiple values selected (OR condition)
            return filterValue.includes(String(cellValue))
          } else if (typeof filterValue === "object" && filterValue !== null) {
            // Range filter
            const { min, max } = filterValue
            const numValue = Number.parseFloat(cellValue)

            if (isNaN(numValue)) return false

            if (min !== undefined && max !== undefined) {
              return numValue >= min && numValue <= max
            } else if (min !== undefined) {
              return numValue >= min
            } else if (max !== undefined) {
              return numValue <= max
            }

            return true
          } else {
            // Single value filter
            return String(cellValue) === String(filterValue)
          }
        })
      }
    })

    // Apply sorting
    if (sortColumn !== null) {
      const columnIndex = Number.parseInt(sortColumn)
      const headerRow = processedData[0]

      processedData = [
        headerRow,
        ...processedData.slice(1).sort((a, b) => {
          const valueA = a[columnIndex]
          const valueB = b[columnIndex]

          // Handle different data types
          if (typeof valueA === "number" && typeof valueB === "number") {
            return sortDirection === "asc" ? valueA - valueB : valueB - valueA
          } else {
            const strA = String(valueA).toLowerCase()
            const strB = String(valueB).toLowerCase()
            return sortDirection === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA)
          }
        }),
      ]
    }

    setFilteredData(processedData)

    // Update pagination
    const totalItems = processedData.length - 1 // Exclude header row
    const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
    setTotalPages(calculatedTotalPages)

    // Ensure current page is valid
    if (currentPage > calculatedTotalPages) {
      setCurrentPage(1)
    }

    // Get visible rows for current page
    const startIndex = (currentPage - 1) * rowsPerPage + 1 // +1 to skip header
    const endIndex = Math.min(startIndex + rowsPerPage, processedData.length)

    // Always include header row (index 0) and then the rows for the current page
    setVisibleRows([processedData[0], ...processedData.slice(startIndex, endIndex)])

    // Recalculate summary data if needed
    if (hasHierarchy) {
      // Update hierarchical data with filtered data
      const updatedHierarchicalData = hierarchicalData.map((row) => {
        // Find the corresponding row in filtered data
        const filteredRow = processedData.find((_, index) => index === row.originalIndex)
        return {
          ...row,
          data: filteredRow || row.data,
        }
      })

      calculateSummaryData(updatedHierarchicalData, processedData[0])
    }
  }

  // Update when search, sort, or filters change
  useEffect(() => {
    if (editableData.length > 0) {
      applyFiltersAndSort(editableData)
    }
  }, [searchTerm, sortColumn, sortDirection, activeFilters, editableData, currentPage, rowsPerPage])

  // Toggle row expansion in hierarchical view
  const toggleRowExpansion = (rowId: string) => {
    console.log("Toggling row expansion for:", rowId)

    // Toggle in expanded categories set
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        console.log("Collapsing row:", rowId)
        newSet.delete(rowId)
      } else {
        console.log("Expanding row:", rowId)
        newSet.add(rowId)
      }
      return newSet
    })
  }

  // Toggle column visibility
  const toggleColumnVisibility = (columnIndex: number) => {
    setVisibleColumns((prev) => {
      if (prev.includes(columnIndex)) {
        return prev.filter((col) => col !== columnIndex)
      } else {
        return [...prev, columnIndex].sort((a, b) => {
          // Sort by original column order
          return columnOrder.indexOf(a) - columnOrder.indexOf(b)
        })
      }
    })
  }

  // Toggle column pinning
  const toggleColumnPin = (columnIndex: number) => {
    setPinnedColumns((prev) => {
      if (prev.includes(columnIndex)) {
        return prev.filter((col) => col !== columnIndex)
      } else {
        return [...prev, columnIndex].sort()
      }
    })
  }

  // Handle column resize start
  const handleResizeStart = (e: React.MouseEvent, columnIndex: number) => {
    e.preventDefault()
    setResizingColumn(columnIndex)
    setStartX(e.clientX)
    setStartWidth(columnWidths[columnIndex] || 150)

    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumn !== null) {
        const width = Math.max(80, startWidth + (e.clientX - startX))
        setColumnWidths((prev) => ({
          ...prev,
          [resizingColumn]: width,
        }))
      }
    }

    const handleMouseUp = () => {
      setResizingColumn(null)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle cell edit
  const handleCellEdit = (rowIndex: number, columnIndex: number, value: string) => {
    if (!isEditing) return

    setEditableData((prevData) => {
      const newData = [...prevData]

      // Update the cell value
      if (newData[rowIndex]) {
        newData[rowIndex] = [...newData[rowIndex]]
        newData[rowIndex][columnIndex] = value

        // Check if this is a formula
        if (isFormula(value)) {
          setFormulaMap((prev) => ({
            ...prev,
            [`${rowIndex}-${columnIndex}`]: value,
          }))
        } else {
          // Remove from formula map if it was a formula before
          if (formulaMap[`${rowIndex}-${columnIndex}`]) {
            const newFormulaMap = { ...formulaMap }
            delete newFormulaMap[`${rowIndex}-${columnIndex}`]
            setFormulaMap(newFormulaMap)
          }
        }

        // Recalculate formulas that might depend on this cell
        Object.entries(formulaMap).forEach(([cellKey, formula]) => {
          const [fRowIndex, fColIndex] = cellKey.split("-").map(Number)

          if (fRowIndex !== rowIndex || fColIndex !== columnIndex) {
            newData[fRowIndex][fColIndex] = evaluateFormula(formula, newData[fRowIndex], newData)
          }
        })
      }

      return newData
    })
  }

  // Save changes
  const saveChanges = () => {
    setOriginalData([...editableData])
    setIsEditing(false)

    // Update the report in localStorage
    const report = getSelectedReportData()
    if (report) {
      const updatedReport = { ...report }

      if (report.type === "table") {
        updatedReport.data.tables[0].data = editableData
      } else if (report.data && report.data.tables) {
        updatedReport.data.tables[0].data = editableData
      }

      const updatedReports = reports.map((r) => (r.id === report.id ? updatedReport : r))
      setReports(updatedReports)
      localStorage.setItem("reports", JSON.stringify(updatedReports))
    }

    // Recalculate summary data if needed
    if (hasHierarchy) {
      const updatedHierarchicalData = hierarchicalData.map((row) => ({
        ...row,
        data: editableData[row.originalIndex],
      }))

      calculateSummaryData(updatedHierarchicalData, editableData[0])
    }
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditableData([...originalData])
    setIsEditing(false)
  }

  // Export table to CSV
  const exportToCSV = () => {
    const tables = getTablesFromReport()
    if (tables.length === 0) return

    const selectedTable = tables[0]
    if (!selectedTable) return

    const headers = selectedTable.headers || selectedTable.data[0]
    const data = selectedTable.data

    let csvContent = headers.join(",") + "\n"
    data.slice(1).forEach((row: any[]) => {
      csvContent +=
        row
          .map((cell) => {
            // Handle cells with commas by wrapping in quotes
            if (String(cell).includes(",")) {
              return `"${cell}"`
            }
            return cell
          })
          .join(",") + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${getSelectedReportData()?.name || "table"}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get unique values for a column (for filtering)
  const getUniqueValuesForColumn = (columnIndex: number) => {
    if (!editableData || editableData.length <= 1) return []

    const values = new Set<string>()

    editableData.slice(1).forEach((row) => {
      if (row[columnIndex] !== undefined) {
        values.add(String(row[columnIndex]))
      }
    })

    return Array.from(values).sort()
  }

  // Add a filter for a column
  const addFilter = (columnIndex: number, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [columnIndex]: value,
    }))
  }

  // Remove a filter
  const removeFilter = (columnIndex: number) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[columnIndex]
      return newFilters
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({})
    setSearchTerm("")
  }

  // Get filter badge text
  const getFilterBadgeText = () => {
    const filterCount = Object.keys(activeFilters).length
    if (filterCount === 0) return null

    return `${filterCount} filter${filterCount > 1 ? "s" : ""} active`
  }

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Refresh data
  const refreshData = () => {
    setIsRefreshing(true)

    // Re-apply filters and sorting
    applyFiltersAndSort(editableData)

    // Reset pagination to first page
    setCurrentPage(1)

    setTimeout(() => {
      setIsRefreshing(false)
    }, 500)
  }

  // Expand all categories
  const expandAllCategories = () => {
    const allCategoryIds = hierarchicalData.filter((row) => row.isCategory).map((row) => row.id)
    setExpandedCategories(new Set(allCategoryIds))
  }

  // Collapse all categories
  const collapseAllCategories = () => {
    // Keep only top-level categories expanded
    const topLevelCategories = hierarchicalData.filter((row) => row.isCategory && row.level === 0).map((row) => row.id)
    setExpandedCategories(new Set(topLevelCategories))
  }

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)

    if (!isFullScreen) {
      // Enter fullscreen
      const element = tableContainerRef.current
      if (element) {
        if (element.requestFullscreen) {
          element.requestFullscreen()
        }
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Get cell class based on data type
  const getCellClass = (value: any, isHeader = false) => {
    if (isHeader) return "font-medium text-left"

    if (value === null || value === undefined) return "text-muted-foreground"

    if (typeof value === "number") {
      return "text-right font-mono"
    }

    if (typeof value === "boolean") {
      return value ? "text-green-600" : "text-red-600"
    }

    if (typeof value === "string" && isFormula(value)) {
      return "text-blue-600 font-mono"
    }

    return ""
  }

  // Determine if a row is a total/subtotal row
  const isTotalRow = (row: any[]) => {
    if (!row || row.length === 0) return false
    const firstCell = String(row[0] || "").toLowerCase()
    return firstCell.includes("total") || firstCell.includes("subtotal") || firstCell.includes("sum")
  }

  // Check if a row should be visible based on its parent's expansion state
  const isRowVisible = (row: HierarchicalRow) => {
    // Always show header row
    if (row.originalIndex === 0) return true

    // For other rows, check parent visibility
    if (row.parentId === null) return true

    // Check if any parent in the chain is collapsed
    let currentParentId = row.parentId
    let depth = 0 // Prevent infinite loops

    while (currentParentId && depth < 100) {
      if (!expandedCategories.has(currentParentId)) {
        return false
      }

      // Get parent's parent
      const parent = hierarchicalData.find((r) => r.id === currentParentId)
      currentParentId = parent?.parentId || null
      depth++
    }

    return true
  }

  // Render the modern table view
  const renderModernTable = () => {
    if (!filteredData || filteredData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[400px] border rounded-md">
          <div className="text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No data available</h3>
            <p className="text-muted-foreground">Try adjusting your filters or import a new table</p>
          </div>
        </div>
      )
    }

    return (
      <div
        className={`relative border rounded-md overflow-hidden ${isFullScreen ? "h-screen" : "h-[600px]"}`}
        ref={tableContainerRef}
      >
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={toggleFullScreen}>
                  {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFullScreen ? "Exit fullscreen" : "Fullscreen"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={refreshData} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="h-full overflow-auto" ref={tableRef}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-background z-10 shadow-sm">
              <tr>
                {filteredData[0]?.map((header: any, index: number) => {
                  if (!visibleColumns.includes(index)) return null

                  const isPinned = pinnedColumns.includes(index)

                  return (
                    <th
                      key={index}
                      className={`
                        p-3 border-b text-left select-none
                        ${isPinned ? "sticky left-0 z-20 bg-background" : ""}
                        ${sortColumn === String(index) ? "bg-muted" : ""}
                      `}
                      style={{
                        width: `${columnWidths[index] || 150}px`,
                        minWidth: `${columnWidths[index] || 150}px`,
                      }}
                    >
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center cursor-pointer" onClick={() => handleSort(String(index))}>
                          <span>{header}</span>
                          {sortColumn === String(index) ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="ml-1 h-4 w-4" />
                            ) : (
                              <ArrowDown className="ml-1 h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100" />
                          )}
                        </div>

                        <div className="flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Column Options</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuCheckboxItem
                                checked={pinnedColumns.includes(index)}
                                onCheckedChange={() => toggleColumnPin(index)}
                              >
                                Pin Column
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuItem onClick={() => toggleColumnVisibility(index)}>
                                Hide Column
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  // Open filter sheet and focus on this column
                                  document.querySelector("[data-filter-button]")?.click()
                                }}
                              >
                                Filter by {header}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <div
                            className="w-1 h-full cursor-col-resize opacity-0 group-hover:opacity-100 hover:bg-primary"
                            onMouseDown={(e) => handleResizeStart(e, index)}
                          ></div>
                        </div>
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {hasHierarchy
                ? // Hierarchical view (like P&L statement)
                  hierarchicalData
                    .filter(isRowVisible)
                    .map((row) => {
                      const isTotal = isTotalRow(row.data)

                      return (
                        <tr
                          key={row.id}
                          className={`
                            group hover:bg-muted/50 
                            ${row.isCategory ? "font-medium" : ""} 
                            ${isTotal ? "bg-muted/30 font-semibold" : ""}
                            ${hoveredRow === row.id ? "bg-muted/70" : ""}
                          `}
                          onMouseEnter={() => setHoveredRow(row.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {row.data.map((cell: any, cellIndex: number) => {
                            if (!visibleColumns.includes(cellIndex)) return null

                            const isPinned = pinnedColumns.includes(cellIndex)

                            if (cellIndex === 0) {
                              return (
                                <td
                                  key={cellIndex}
                                  className={`
                                    p-3 border-b
                                    ${isPinned ? "sticky left-0 z-10 bg-background group-hover:bg-muted/50" : ""}
                                    ${isTotal ? "bg-muted/30 group-hover:bg-muted/70" : ""}
                                  `}
                                >
                                  <div className="flex items-center" style={{ paddingLeft: `${row.level * 16}px` }}>
                                    {row.isCategory && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 mr-1 p-0"
                                        onClick={() => toggleRowExpansion(row.id)}
                                      >
                                        {expandedCategories.has(row.id) ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}
                                    {isEditing ? (
                                      <Input
                                        value={cell}
                                        onChange={(e) => handleCellEdit(row.originalIndex, cellIndex, e.target.value)}
                                        className="h-7 py-1"
                                      />
                                    ) : (
                                      <span className={getCellClass(cell)}>{formatCellValue(cell)}</span>
                                    )}
                                  </div>
                                </td>
                              )
                            }

                            return (
                              <td
                                key={cellIndex}
                                className={`
                                  p-3 border-b
                                  ${isPinned ? "sticky left-0 z-10 bg-background group-hover:bg-muted/50" : ""}
                                  ${getCellClass(cell)}
                                  ${isTotal ? "bg-muted/30 group-hover:bg-muted/70" : ""}
                                `}
                              >
                                {isEditing ? (
                                  <Input
                                    value={cell}
                                    onChange={(e) => handleCellEdit(row.originalIndex, cellIndex, e.target.value)}
                                    className="h-7 py-1"
                                  />
                                ) : isFormula(cell) ? (
                                  <span className="text-blue-600 font-mono">
                                    {formatCellValue(evaluateFormula(cell, row.data, filteredData))}
                                  </span>
                                ) : (
                                  <span>{formatCellValue(cell)}</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                : // Regular table view
                  visibleRows
                    .slice(1) // Skip header row (already in TableHeader)
                    .map((row, rowIndex) => {
                      const isTotal = isTotalRow(row)
                      const rowId = `regular-${rowIndex}`

                      return (
                        <tr
                          key={rowIndex}
                          className={`
                            group hover:bg-muted/50 
                            ${isTotal ? "bg-muted/30 font-semibold" : ""}
                            ${hoveredRow === rowId ? "bg-muted/70" : ""}
                          `}
                          onMouseEnter={() => setHoveredRow(rowId)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {row.map((cell: any, cellIndex: number) => {
                            if (!visibleColumns.includes(cellIndex)) return null

                            const isPinned = pinnedColumns.includes(cellIndex)

                            return (
                              <td
                                key={cellIndex}
                                className={`
                                    p-3 border-b
                                    ${isPinned ? "sticky left-0 z-10 bg-background group-hover:bg-muted/50" : ""}
                                    ${getCellClass(cell)}
                                    ${isTotal ? "bg-muted/30 group-hover:bg-muted/70" : ""}
                                  `}
                              >
                                {isEditing ? (
                                  <Input
                                    value={cell}
                                    onChange={(e) =>
                                      handleCellEdit(
                                        (currentPage - 1) * rowsPerPage + rowIndex + 1,
                                        cellIndex,
                                        e.target.value,
                                      )
                                    }
                                    className="h-7 py-1"
                                  />
                                ) : isFormula(cell) ? (
                                  <span className="text-blue-600 font-mono">
                                    {formatCellValue(evaluateFormula(cell, row, filteredData))}
                                  </span>
                                ) : (
                                  <span>{formatCellValue(cell)}</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Render the card view
  const renderCardView = () => {
    if (!filteredData || filteredData.length <= 1) {
      return (
        <div className="flex items-center justify-center h-[400px] border rounded-md">
          <div className="text-center">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No data available</h3>
            <p className="text-muted-foreground">Try adjusting your filters or import a new table</p>
          </div>
        </div>
      )
    }

    const headers = filteredData[0]

    return (
      <div className="space-y-4">
        {visibleRows.slice(1).map((row, rowIndex) => (
          <Card key={rowIndex} className="overflow-hidden">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-lg">{row[0] || `Row ${rowIndex + 1}`}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {row.map((cell, cellIndex) => {
                  if (cellIndex === 0 || !visibleColumns.includes(cellIndex)) return null

                  return (
                    <div key={cellIndex} className="space-y-1">
                      <div className="text-sm text-muted-foreground">{headers[cellIndex]}</div>
                      <div className={`font-medium ${getCellClass(cell)}`}>
                        {isFormula(cell)
                          ? formatCellValue(evaluateFormula(cell, row, filteredData))
                          : formatCellValue(cell)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Imported Tables</h2>
          <p className="text-muted-foreground">View, edit and analyze imported table data</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import Table
          </Button>
        </div>
      </div>

      {reports.length === 0 && !useSampleData ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <FileSpreadsheet className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tables imported yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Import Excel files to view and analyze table data in the CRM
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setUploadDialogOpen(true)}>Import Table</Button>
              <Button variant="outline" onClick={() => setUseSampleData(true)}>
                Use Sample Data
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList>
              <TabsTrigger value="data">Table Data</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="settings">Table Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-64">
                  <Card>
                    <CardHeader>
                      <CardTitle>Imported Tables</CardTitle>
                      <CardDescription>Select a table to view</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {useSampleData && (
                            <Button variant="default" className="w-full justify-start">
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              Sample Financial Data
                            </Button>
                          )}
                          {reports.map((report) => (
                            <Button
                              key={report.id}
                              variant={selectedReport === report.id ? "default" : "outline"}
                              className="w-full justify-start"
                              onClick={() => setSelectedReport(report.id)}
                            >
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              {report.name}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1">
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <CardTitle>
                            {useSampleData ? "Sample Financial Data" : getSelectedReportData()?.name}
                          </CardTitle>
                          <CardDescription>
                            {useSampleData
                              ? "Sample data for demonstration"
                              : `Imported on ${
                                  getSelectedReportData()?.uploadDate
                                    ? new Date(getSelectedReportData()?.uploadDate).toLocaleDateString()
                                    : "N/A"
                                }`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                          <div className="relative w-full md:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search table..."
                              className="pl-8"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>

                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="icon" data-filter-button>
                                <Filter className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Filter Table Data</SheetTitle>
                                <SheetDescription>Apply filters to narrow down your data</SheetDescription>
                              </SheetHeader>
                              <div className="py-4">
                                <ScrollArea className="h-[calc(100vh-200px)]" ref={filterScrollAreaRef}>
                                  <div className="space-y-4 pr-4">
                                    {editableData[0]?.map((header: any, index: number) => (
                                      <div key={index} className="space-y-2">
                                        <h4 className="font-medium">{header}</h4>
                                        <div className="pl-2 space-y-1 max-h-[200px] overflow-y-auto">
                                          {getUniqueValuesForColumn(index).map((value, valueIndex) => (
                                            <div key={valueIndex} className="flex items-center space-x-2">
                                              <Checkbox
                                                id={`filter-${index}-${valueIndex}`}
                                                checked={
                                                  activeFilters[index] === value ||
                                                  (Array.isArray(activeFilters[index]) &&
                                                    activeFilters[index].includes(value))
                                                }
                                                onCheckedChange={(checked) => {
                                                  if (checked) {
                                                    if (activeFilters[index]) {
                                                      if (Array.isArray(activeFilters[index])) {
                                                        addFilter(index, [...activeFilters[index], value])
                                                      } else {
                                                        addFilter(index, [activeFilters[index], value])
                                                      }
                                                    } else {
                                                      addFilter(index, value)
                                                    }
                                                  } else {
                                                    if (Array.isArray(activeFilters[index])) {
                                                      const newValues = activeFilters[index].filter(
                                                        (v: string) => v !== value,
                                                      )
                                                      if (newValues.length === 0) {
                                                        removeFilter(index)
                                                      } else if (newValues.length === 1) {
                                                        addFilter(index, newValues[0])
                                                      } else {
                                                        addFilter(index, newValues)
                                                      }
                                                    } else {
                                                      removeFilter(index)
                                                    }
                                                  }
                                                }}
                                              />
                                              <label
                                                htmlFor={`filter-${index}-${valueIndex}`}
                                                className="text-sm cursor-pointer"
                                              >
                                                {value}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>

                                <div className="flex justify-between mt-6">
                                  <Button variant="outline" onClick={clearAllFilters}>
                                    Clear All
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      document.querySelector('[data-radix-collection-item][data-state="open"]')?.click()
                                    }}
                                  >
                                    Apply Filters
                                  </Button>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Columns className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                              <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {editableData[0]?.map((header: any, index: number) => (
                                <DropdownMenuCheckboxItem
                                  key={index}
                                  checked={visibleColumns.includes(index)}
                                  onCheckedChange={() => toggleColumnVisibility(index)}
                                >
                                  {header}
                                </DropdownMenuCheckboxItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <Settings2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Table Options</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuCheckboxItem
                                checked={tableView === "table"}
                                onCheckedChange={() => setTableView("table")}
                              >
                                Table View
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem
                                checked={tableView === "card"}
                                onCheckedChange={() => setTableView("card")}
                              >
                                Card View
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={expandAllCategories}>Expand All Categories</DropdownMenuItem>
                              <DropdownMenuItem onClick={collapseAllCategories}>
                                Collapse All Categories
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)}>Edit Table</Button>
                          ) : (
                            <>
                              <Button variant="outline" onClick={cancelEditing}>
                                Cancel
                              </Button>
                              <Button onClick={saveChanges}>Save</Button>
                            </>
                          )}
                        </div>
                      </div>

                      {getFilterBadgeText() && (
                        <div className="mt-2 flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {getFilterBadgeText()}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                            Clear All
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {hasHierarchy && tableView === "table" && (
                        <div className="mb-4 flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={expandAllCategories}>
                            Expand All
                          </Button>
                          <Button variant="outline" size="sm" onClick={collapseAllCategories}>
                            Collapse All
                          </Button>
                          <Separator orientation="vertical" className="h-6" />
                          <span className="text-sm text-muted-foreground">
                            Click on category rows to expand/collapse
                          </span>
                        </div>
                      )}

                      {dataLoaded ? (
                        tableView === "table" ? (
                          renderModernTable()
                        ) : (
                          renderCardView()
                        )
                      ) : (
                        <div className="flex items-center justify-center h-[400px]">
                          <div className="text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">Loading table data...</h3>
                          </div>
                        </div>
                      )}

                      {!hasHierarchy && tableView === "table" && totalPages > 1 && (
                        <div className="mt-4 flex justify-center">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                />
                              </PaginationItem>

                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Show pages around current page
                                let pageNum
                                if (totalPages <= 5) {
                                  pageNum = i + 1
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i
                                } else {
                                  pageNum = currentPage - 2 + i
                                }

                                return (
                                  <PaginationItem key={i}>
                                    <PaginationLink
                                      isActive={pageNum === currentPage}
                                      onClick={() => setCurrentPage(pageNum)}
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                )
                              })}

                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage === totalPages}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t">
                      <div className="w-full">
                        <h4 className="font-medium mb-2">Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {Object.entries(summaryData).map(([key, value], index) => {
                            const [category, column] = key.split("-")
                            return (
                              <div
                                key={index}
                                className="p-3 border rounded-md bg-muted/10 hover:bg-muted/20 transition-colors"
                              >
                                <div className="text-sm text-muted-foreground">
                                  {category} - {column}
                                </div>
                                <div className="text-lg font-medium">
                                  {typeof value === "number" ? value.toLocaleString() : value}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Table Analysis</CardTitle>
                  <CardDescription>Analyze your table data</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Analysis features will be implemented soon.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Table Settings</CardTitle>
                  <CardDescription>Configure table display and behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Table Display</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="detect-hierarchy"
                            checked={hasHierarchy}
                            onChange={() => setHasHierarchy(!hasHierarchy)}
                          />
                          <label htmlFor="detect-hierarchy">
                            Detect hierarchical structure (categories and subcategories)
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="evaluate-formulas"
                            checked={hasFormulas}
                            onChange={() => setHasFormulas(!hasFormulas)}
                          />
                          <label htmlFor="evaluate-formulas">Evaluate formulas in cells</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="toggle-view"
                            checked={tableView === "table"}
                            onCheckedChange={(checked) => setTableView(checked ? "table" : "card")}
                          />
                          <label htmlFor="toggle-view">Use table view (uncheck for card view)</label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Pagination</h3>
                      <div className="flex items-center space-x-2">
                        <label htmlFor="rows-per-page" className="text-sm">
                          Rows per page:
                        </label>
                        <select
                          id="rows-per-page"
                          value={rowsPerPage}
                          onChange={(e) => setRowsPerPage(Number(e.target.value))}
                          className="border rounded px-2 py-1"
                        >
                          <option value="10">10</option>
                          <option value="25">25</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                          <option value="250">250</option>
                          <option value="500">500</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Visible Columns</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {editableData[0]?.map((header: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                              id={`settings-column-${index}`}
                              checked={visibleColumns.includes(index)}
                              onCheckedChange={() => toggleColumnVisibility(index)}
                            />
                            <label htmlFor={`settings-column-${index}`}>{header}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Pinned Columns</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {editableData[0]?.map((header: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox
                              id={`pin-column-${index}`}
                              checked={pinnedColumns.includes(index)}
                              onCheckedChange={() => toggleColumnPin(index)}
                            />
                            <label htmlFor={`pin-column-${index}`}>{header}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <ReportUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  )
}
