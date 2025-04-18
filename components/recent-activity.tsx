import { PhoneCall, Mail, Calendar, CheckCircle2, DollarSign } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "call",
    title: "Call with John Doe",
    description: "Discussed new proposal details",
    time: "2 hours ago",
    icon: <PhoneCall className="h-4 w-4" />,
    iconColor: "bg-blue-100 text-blue-800",
  },
  {
    id: 2,
    type: "email",
    title: "Email to Globex Inc",
    description: "Sent contract for review",
    time: "4 hours ago",
    icon: <Mail className="h-4 w-4" />,
    iconColor: "bg-purple-100 text-purple-800",
  },
  {
    id: 3,
    type: "meeting",
    title: "Meeting with Stark Industries",
    description: "Product demo scheduled",
    time: "Yesterday",
    icon: <Calendar className="h-4 w-4" />,
    iconColor: "bg-indigo-100 text-indigo-800",
  },
  {
    id: 4,
    type: "task",
    title: "Completed proposal for Umbrella Corp",
    description: "Sent to review team",
    time: "Yesterday",
    icon: <CheckCircle2 className="h-4 w-4" />,
    iconColor: "bg-green-100 text-green-800",
  },
  {
    id: 5,
    type: "deal",
    title: "Closed deal with Acme Corp",
    description: "$45,000 - Enterprise Package",
    time: "2 days ago",
    icon: <DollarSign className="h-4 w-4" />,
    iconColor: "bg-amber-100 text-amber-800",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div className="flex items-start" key={activity.id}>
          <div className={`${activity.iconColor} mr-4 rounded-full p-2`}>{activity.icon}</div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{activity.title}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
