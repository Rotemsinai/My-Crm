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
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const deals = [
  {
    id: "DEAL-001",
    name: "Enterprise Software Package",
    customer: "Acme Corp",
    stage: "Proposal",
    value: "$45,000",
    probability: 60,
    expectedCloseDate: "2023-05-15",
  },
  {
    id: "DEAL-002",
    name: "Cloud Migration Services",
    customer: "Globex Inc",
    stage: "Negotiation",
    value: "$72,500",
    probability: 80,
    expectedCloseDate: "2023-04-30",
  },
  {
    id: "DEAL-003",
    name: "IT Support Contract",
    customer: "Initech LLC",
    stage: "Discovery",
    value: "$12,000",
    probability: 30,
    expectedCloseDate: "2023-06-10",
  },
  {
    id: "DEAL-004",
    name: "Security Implementation",
    customer: "Umbrella Corp",
    stage: "Closed Won",
    value: "$95,000",
    probability: 100,
    expectedCloseDate: "2023-04-05",
  },
  {
    id: "DEAL-005",
    name: "Custom Development Project",
    customer: "Stark Industries",
    stage: "Proposal",
    value: "$120,000",
    probability: 50,
    expectedCloseDate: "2023-05-20",
  },
]

const getStageColor = (stage: string) => {
  switch (stage) {
    case "Discovery":
      return "bg-blue-100 text-blue-800"
    case "Proposal":
      return "bg-purple-100 text-purple-800"
    case "Negotiation":
      return "bg-amber-100 text-amber-800"
    case "Closed Won":
      return "bg-green-100 text-green-800"
    case "Closed Lost":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function DealsTable() {
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
              <TableHead>Deal</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell>
                  <div className="font-medium">{deal.name}</div>
                  <div className="text-sm text-muted-foreground">{deal.id}</div>
                </TableCell>
                <TableCell>{deal.customer}</TableCell>
                <TableCell>
                  <Badge className={`${getStageColor(deal.stage)}`} variant="outline">
                    {deal.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={deal.probability} className="w-[60px]" />
                    <span>{deal.probability}%</span>
                  </div>
                </TableCell>
                <TableCell>{deal.expectedCloseDate}</TableCell>
                <TableCell className="text-right font-medium">{deal.value}</TableCell>
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
                      <DropdownMenuItem>Edit deal</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Change stage</DropdownMenuItem>
                      <DropdownMenuItem>Add task</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Delete deal</DropdownMenuItem>
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
