"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface Performer {
  id: string
  name: string
  avatar?: string
  initials: string
  amount: number
  jobsCount: number
}

// Sample data - in a real app, this would come from your API
const performers: Performer[] = [
  {
    id: "1",
    name: "John Smith",
    initials: "JS",
    amount: 3245,
    jobsCount: 42,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    initials: "SJ",
    amount: 2870,
    jobsCount: 38,
  },
  {
    id: "3",
    name: "Michael Brown",
    initials: "MB",
    amount: 2150,
    jobsCount: 31,
  },
  {
    id: "4",
    name: "Emily Davis",
    initials: "ED",
    amount: 1980,
    jobsCount: 27,
  },
  {
    id: "5",
    name: "David Wilson",
    initials: "DW",
    amount: 1540,
    jobsCount: 22,
  },
]

export function TopPerformers() {
  const maxAmount = Math.max(...performers.map((p) => p.amount))

  return (
    <div className="space-y-4">
      {performers.map((performer) => (
        <div key={performer.id} className="flex items-center space-x-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={performer.avatar || "/placeholder.svg"} alt={performer.name} />
            <AvatarFallback>{performer.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium leading-none">{performer.name}</p>
              <p className="text-sm font-medium">${performer.amount.toLocaleString()}</p>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Progress value={(performer.amount / maxAmount) * 100} className="h-2" />
              <span className="ml-2">{performer.jobsCount} jobs</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
