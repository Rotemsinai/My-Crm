"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddTaskDialog } from "./add-task-dialog"
import { ReportUploadDialog } from "./report-upload-dialog"

export function DashboardActions() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isReportUploadOpen, setIsReportUploadOpen] = useState(false)

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={() => setIsAddTaskOpen(true)} size="sm">
        <Plus className="mr-1 h-4 w-4" />
        Add Task
      </Button>
      <Button onClick={() => setIsReportUploadOpen(true)} size="sm" variant="outline">
        <Plus className="mr-1 h-4 w-4" />
        Upload Report
      </Button>
      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} />
      <ReportUploadDialog open={isReportUploadOpen} onOpenChange={setIsReportUploadOpen} />
    </div>
  )
}
