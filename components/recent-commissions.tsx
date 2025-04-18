"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"

interface Commission {
  id: string
  userName: string
  userInitials: string
  userAvatar?: string
  jobName: string
  ruleName: string
  amount: number
  date: string
  isPaid: boolean
}

// Sample data - in a real app, this would come from your API
const commissions: Commission[] = [
  {
    id: "1",
    userName: "John Smith",
    userInitials: "JS",
    jobName: "AC Installation - Johnson Residence",
    ruleName: "Standard Sales Commission",
    amount: 350,
    date: "2023-06-15T14:30:00Z",
    isPaid: true,
  },
  {
    id: "2",
    userName: "Sarah Johnson",
    userInitials: "SJ",
    jobName: "Plumbing Repair - Oakwood Apartments",
    ruleName: "Premium Service Bonus",
    amount: 275,
    date: "2023-06-16T10:15:00Z",
    isPaid: true,
  },
  {
    id: "3",
    userName: "Michael Brown",
    userInitials: "MB",
    jobName: "Electrical Rewiring - Smith Office",
    ruleName: "High-Value Job Commission",
    amount: 520,
    date: "2023-06-17T16:45:00Z",
    isPaid: false,
  },
  {
    id: "4",
    userName: "Emily Davis",
    userInitials: "ED",
    jobName: "HVAC Maintenance - Riverside Hotel",
    ruleName: "Standard Sales Commission",
    amount: 180,
    date: "2023-06-18T09:30:00Z",
    isPaid: false,
  },
  {
    id: "5",
    userName: "David Wilson",
    userInitials: "DW",
    jobName: "New Customer - Thompson Residence",
    ruleName: "New Customer Acquisition",
    amount: 50,
    date: "2023-06-19T11:20:00Z",
    isPaid: false,
  },
]

export function RecentCommissions() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Job</TableHead>
          <TableHead>Rule</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {commissions.map((commission) => (
          <TableRow key={commission.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={commission.userAvatar || "/placeholder.svg"} alt={commission.userName} />
                  <AvatarFallback>{commission.userInitials}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{commission.userName}</span>
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate" title={commission.jobName}>
              {commission.jobName}
            </TableCell>
            <TableCell>{commission.ruleName}</TableCell>
            <TableCell>${commission.amount.toLocaleString()}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge variant={commission.isPaid ? "outline" : "secondary"}>
                  {commission.isPaid ? "Paid" : "Pending"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(commission.date), { addSuffix: true })}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
