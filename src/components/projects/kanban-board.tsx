"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateIssueStatus } from "@/app/actions/issues"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"

type Issue = {
  id: string
  title: string
  status: string
  priority: string
  assignee?: {
    name: string
    avatar: string | null
  } | null
}

const COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" }
]

export function KanbanBoard({ projectId, initialIssues }: { projectId: string, initialIssues: Issue[] }) {
  const [issues, setIssues] = useState(initialIssues)
  const router = useRouter()

  async function handleMove(issueId: string, newStatus: string) {
    // Optimistic update
    setIssues(current => 
      current.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    )
    
    // Server update
    await updateIssueStatus(issueId, newStatus)
    router.refresh()
  }

  return (
    <div className="flex gap-6 h-full items-start">
      {COLUMNS.map(column => {
        const columnIssues = issues.filter(i => i.status === column.id)
        
        return (
          <div key={column.id} className="flex-shrink-0 w-80 bg-muted/30 rounded-lg p-4 flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{column.title}</h3>
              <Badge variant="secondary">{columnIssues.length}</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {columnIssues.map(issue => (
                <Card key={issue.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium leading-snug">{issue.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mt-4">
                      <Badge variant={issue.priority === "HIGH" ? "destructive" : "outline"} className="text-[10px]">
                        {issue.priority}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        {column.id !== "TODO" && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                            e.stopPropagation();
                            handleMove(issue.id, column.id === "DONE" ? "IN_PROGRESS" : "TODO");
                          }}>
                            <ArrowLeft className="h-3 w-3" />
                          </Button>
                        )}
                        {column.id !== "DONE" && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                            e.stopPropagation();
                            handleMove(issue.id, column.id === "TODO" ? "IN_PROGRESS" : "DONE");
                          }}>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {columnIssues.length === 0 && (
                <div className="text-center p-4 text-sm text-muted-foreground border-2 border-dashed rounded-md">
                  No issues
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
