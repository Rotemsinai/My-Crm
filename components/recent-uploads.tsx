"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

const uploads = [
  {
    id: "UPL-001",
    name: "April 1-15 P&L",
    date: "2023-04-16",
    status: "Processed",
    user: "Sarah Connor",
  },
  {
    id: "UPL-002",
    name: "March 16-31 P&L",
    date: "2023-04-01",
    status: "Processed",
    user: "Sarah Connor",
  },
  {
    id: "UPL-003",
    name: "March 1-15 P&L",
    date: "2023-03-16",
    status: "Processed",
    user: "John Doe",
  },
  {
    id: "UPL-004",
    name: "February 16-28 P&L",
    date: "2023-03-01",
    status: "Processed",
    user: "Sarah Connor",
  },
  {
    id: "UPL-005",
    name: "February 1-15 P&L",
    date: "2023-02-16",
    status: "Processed",
    user: "John Doe",
  },
]

export function RecentUploads() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Report</TableHead>
          <TableHead>Date Uploaded</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Uploaded By</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {uploads.map((upload) => (
          <TableRow key={upload.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                <span>{upload.name}</span>
              </div>
            </TableCell>
            <TableCell>{upload.date}</TableCell>
            <TableCell>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {upload.status}
              </Badge>
            </TableCell>
            <TableCell>{upload.user}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
