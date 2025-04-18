import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Mail, Phone } from "lucide-react"

const customers = [
  {
    id: "CUST-001",
    name: "Acme Corp",
    contact: "John Doe",
    email: "john@acmecorp.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    lastContact: "2023-04-12",
    value: "$45,000",
  },
  {
    id: "CUST-002",
    name: "Globex Inc",
    contact: "Jane Smith",
    email: "jane@globexinc.com",
    phone: "+1 (555) 987-6543",
    status: "Active",
    lastContact: "2023-04-10",
    value: "$72,500",
  },
  {
    id: "CUST-003",
    name: "Initech LLC",
    contact: "Michael Bolton",
    email: "michael@initech.com",
    phone: "+1 (555) 234-5678",
    status: "Inactive",
    lastContact: "2023-03-28",
    value: "$12,000",
  },
  {
    id: "CUST-004",
    name: "Umbrella Corp",
    contact: "Alice Johnson",
    email: "alice@umbrella.com",
    phone: "+1 (555) 876-5432",
    status: "Active",
    lastContact: "2023-04-15",
    value: "$95,000",
  },
  {
    id: "CUST-005",
    name: "Stark Industries",
    contact: "Tony Stark",
    email: "tony@stark.com",
    phone: "+1 (555) 432-1098",
    status: "Active",
    lastContact: "2023-04-14",
    value: "$120,000",
  },
]

export function CustomerTable() {
  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Button variant="outline" className="ml-auto">
          Export
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Contact</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.id}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{customer.contact}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      customer.status === "Active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {customer.status}
                  </div>
                </TableCell>
                <TableCell>{customer.lastContact}</TableCell>
                <TableCell className="text-right">{customer.value}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit customer</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Add deal</DropdownMenuItem>
                      <DropdownMenuItem>Add task</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Delete customer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
