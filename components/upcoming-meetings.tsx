"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
  type: "client" | "internal" | "other"
}

export function UpcomingMeetings() {
  // In a real app, this would be fetched from your API
  const meetings: Meeting[] = [
    {
      id: "1",
      title: "Acme Corp Project Review",
      date: "2023-05-15",
      time: "10:00 AM",
      attendees: ["John Doe", "Jane Smith"],
      type: "client",
    },
    {
      id: "2",
      title: "Weekly Team Sync",
      date: "2023-05-16",
      time: "9:00 AM",
      attendees: ["Team Members"],
      type: "internal",
    },
    {
      id: "3",
      title: "Globex Inc Sales Pitch",
      date: "2023-05-17",
      time: "2:00 PM",
      attendees: ["Jane Smith", "Client Team"],
      type: "client",
    },
  ]

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case "client":
        return "bg-blue-100 text-blue-800"
      case "internal":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <Card key={meeting.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-start p-4">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{meeting.title}</p>
                  <Badge variant="outline" className={getMeetingTypeColor(meeting.type)}>
                    {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  <span className="mr-2">{meeting.date}</span>
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-1 h-3 w-3" />
                  <span>{meeting.attendees.join(", ")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
