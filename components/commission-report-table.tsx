"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Download, Search } from "lucide-react"
import { format } from "date-fns"

interface CommissionReport {
  id: string
  userName: string
  jobId: string
  jobName: string
  ruleName: string
  amount: number
  date: string
  isPaid: boolean
  paidDate?: string
}

// Sample data - in a real app, this would come from your API
const commissionReports: CommissionReport[] = [
  {
    id: "1",
    userName: "John Smith",
    jobId: "JOB-1234",
    jobName: "AC Installation - Johnson Residence",
    ruleName: "Standard Sales Commission",
    amount: 350,
    date: "2023-06-15T14:30:00Z",
    isPaid: true,
    paidDate: "2023-07-01T10:00:00Z",
  },
  {
    id: "2",
    userName: "Sarah Johnson",
    jobId: "JOB-1235",
    jobName: "Plumbing Repair - Oakwood Apartments",
    ruleName: "Premium Service Bonus",
    amount: 275,
    date: "2023-06-16T10:15:00Z",
    isPaid: true,
    paidDate: "2023-07-01T10:00:00Z",
  },
  {
    id: "3",
    userName: "Michael Brown",
    jobId: "JOB-1236",
    jobName: "Electrical Rewiring - Smith Office",
    ruleName: "High-Value Job Commission",
    amount: 520,
    date: "2023-06-17T16:45:00Z",
    isPaid: false,
  },
  {
    id: "4",
    userName: "Emily Davis",
    jobId: "JOB-1237",
    jobName: "HVAC Maintenance - Riverside Hotel",
    ruleName: "Standard Sales Commission",
    amount: 180,
    date: "2023-06-18T09:30:00Z",
    isPaid: false,
  },
  {
    id: "5",
    userName: "David Wilson",
    jobId: "JOB-1238",
    jobName: "New Customer - Thompson Residence",
    ruleName: "New Customer Acquisition",
    amount: 50,
    date: "2023-06-19T11:20:00Z",
    isPaid: false,
  },
  {
    id: "6",
    userName: "John Smith",
    jobId: "JOB-1239",
    jobName: "Furnace Repair - Westside Condos",
    ruleName: "Standard Sales Commission",
    amount: 210,
    date: "2023-06-20T13:45:00Z",
    isPaid: false,
  },
  {
    id: "7",
    userName: "Sarah Johnson",
    jobId: "JOB-1240",
    jobName: "Water Heater Installation - Garcia Home",
    ruleName: "Premium Service Bonus",
    amount: 320,
    date: "2023-06-21T15:30:00Z",
    isPaid: false,
  },
  {
    id: "8",
    userName: "Michael Brown",
    jobId: "JOB-1241",
    jobName: "Commercial Wiring - Downtown Office",
    ruleName: "High-Value Job Commission",
    amount: 680,
    date: "2023-06-22T10:15:00Z",
    isPaid: false,
  },
]

interface CommissionReportTableProps {
  filterStatus?: "pending" | "paid"
}

export function CommissionReportTable({ filterStatus }: CommissionReportTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    userName: true,
    jobId: true,
    jobName: true,
    ruleName: true,
    amount: true,
    date: true,
    status: true,
  })

  const toggleColumn = (column: string) => {
    setVisibleColumns({
      ...visibleColumns,
      [column]: !visibleColumns[column],
    })
  }

  const filteredReports = commissionReports.filter((report) => {
    // Filter by status if provided
    if (filterStatus === "pending" && report.isPaid) return false
    if (filterStatus === "paid" && !report.isPaid) return false

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        report.userName.toLowerCase().includes(term) ||
        report.jobId.toLowerCase().includes(term) ||
        report.jobName.toLowerCase().includes(term) ||
        report.ruleName.toLowerCase().includes(term)
      )
    }
    return true
  })

  const totalAmount = filteredReports.reduce((sum, report) => sum + report.amount, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commissions..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={visibleColumns.userName}
                onCheckedChange={() => toggleColumn("userName")}
              >
                User
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.jobId} onCheckedChange={() => toggleColumn("jobId")}>
                Job ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.jobName}
                onCheckedChange={() => toggleColumn("jobName")}
              >
                Job Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibleColumns.ruleName}
                onCheckedChange={() => toggleColumn("ruleName")}
              >
                Commission Rule
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.amount} onCheckedChange={() => toggleColumn("amount")}>
                Amount
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.date} onCheckedChange={() => toggleColumn("date")}>
                Date
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={visibleColumns.status} onCheckedChange={() => toggleColumn("status")}>
                Status
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {visibleColumns.userName && <TableHead>User</TableHead>}
            {visibleColumns.jobId && <TableHead>Job ID</TableHead>}
            {visibleColumns.jobName && <TableHead>Job Name</TableHead>}
            {visibleColumns.ruleName && <TableHead>Commission Rule</TableHead>}
            {visibleColumns.amount && <TableHead>Amount</TableHead>}
            {visibleColumns.date && <TableHead>Date</TableHead>}
            {visibleColumns.status && <TableHead>Status</TableHead>}
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="h-24 text-center">
                  No commission records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  {visibleColumns.userName && <TableCell>{report.userName}</TableCell>}
                  {visibleColumns.jobId && <TableCell>{report.jobId}</TableCell>}
                  {visibleColumns.jobName && (
                    <TableCell className="max-w-[200px] truncate" title={report.jobName}>
                      {report.jobName}
                    </TableCell>
                  )}
                  {visibleColumns.ruleName && <TableCell>{report.ruleName}</TableCell>}
                  {visibleColumns.amount && <TableCell>${report.amount.toLocaleString()}</TableCell>}
                  {visibleColumns.date && <TableCell>{format(new Date(report.date), "MMM d, yyyy")}</TableCell>}
                  {visibleColumns.status && (
                    <TableCell>
                      <Badge variant={report.isPaid ? "outline" : "secondary"}>
                        {report.isPaid ? "Paid" : "Pending"}
                      </Badge>
                      {report.isPaid && report.paidDate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Paid on {format(new Date(report.paidDate), "MMM d, yyyy")}
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Showing {filteredReports.length} commission records</div>
        <div className="font-medium">Total: ${totalAmount.toLocaleString()}</div>
      </div>
    </div>
  )
}
