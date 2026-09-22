"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateIssueStatus } from "@/app/actions/issues"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  IssueTypeBadge, 
  IssueSeverityBadge, 
  IssuePriorityBadge 
} from "@/components/common/issue-badges"
import { IssueDetailDialog } from "./issue-detail-dialog"
import { 
  ArrowRight, ArrowLeft, Search, Filter, 
  MessageSquare, Calendar, ShieldAlert 
} from "lucide-react"

type Issue = {
  id: string
  key: string
  title: string
  description: string | null
  type: string
  status: string
  priority: string
  severity: string
  module: string
  reproducibility: string
  environment: string
  dueDate: Date | null
  createdAt: Date
  updatedAt: Date
  projectId: string
  assignee?: {
    id: string
    name: string
    avatar: string | null
    role: string
  } | null
  reporter?: {
    id: string
    name: string
    avatar: string | null
  } | null
  milestone?: {
    id: string
    name: string
  } | null
  comments?: Array<{
    id: string
    content: string
    createdAt: Date
    author: {
      name: string
      avatar: string | null
      role: string
    }
  }>
}

const COLUMNS = [
  { id: "OPEN", title: "Open", color: "border-t-blue-500", dot: "bg-blue-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-t-amber-500", dot: "bg-amber-500" },
  { id: "IN_REVIEW", title: "In Review", color: "border-t-purple-500", dot: "bg-purple-500" },
  { id: "RESOLVED", title: "Resolved", color: "border-t-emerald-500", dot: "bg-emerald-500" },
  { id: "CLOSED", title: "Closed", color: "border-t-zinc-400", dot: "bg-zinc-400" },
]

export function KanbanBoard({
  projectId,
  initialIssues,
  users = [],
}: {
  projectId: string
  initialIssues: Issue[]
  users?: Array<{ id: string; name: string; avatar: string | null; role: string }>
}) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  // Filters
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("ALL")
  const [filterSeverity, setFilterSeverity] = useState("ALL")
  const [filterPriority, setFilterPriority] = useState("ALL")

  const router = useRouter()

  // Status index mapping for moving left/right
  const columnOrder = ["OPEN", "IN_PROGRESS", "IN_REVIEW", "RESOLVED", "CLOSED"]

  async function handleMove(issueId: string, newStatus: string) {
    // Optimistic update
    setIssues((current) =>
      current.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    )

    await updateIssueStatus(issueId, newStatus)
    router.refresh()
  }

  // Filtered issues
  const filteredIssues = issues.filter((issue) => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchKey = issue.key.toLowerCase().includes(q)
      const matchTitle = issue.title.toLowerCase().includes(q)
      const matchDesc = issue.description?.toLowerCase().includes(q) || false
      if (!matchKey && !matchTitle && !matchDesc) return false
    }
    if (filterType !== "ALL" && issue.type !== filterType) return false
    if (filterSeverity !== "ALL" && issue.severity !== filterSeverity) return false
    if (filterPriority !== "ALL" && issue.priority !== filterPriority) return false
    return true
  })

  function openIssueDetails(issue: Issue) {
    setSelectedIssue(issue)
    setIsDetailOpen(true)
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Board Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card/60 p-3 rounded-lg border">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by key, title, or keyword..."
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Types</option>
            <option value="BUG">🐛 Bug</option>
            <option value="TASK">📋 Task</option>
            <option value="FEATURE">✨ Feature</option>
            <option value="IMPROVEMENT">⚡ Improvement</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">🚨 Critical</option>
            <option value="MAJOR">⚠️ Major</option>
            <option value="MODERATE">ℹ️ Moderate</option>
            <option value="MINOR">🔍 Minor</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">🔴 Urgent</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">⚪ Low</option>
          </select>

          {(search || filterType !== "ALL" || filterSeverity !== "ALL" || filterPriority !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("")
                setFilterType("ALL")
                setFilterSeverity("ALL")
                setFilterPriority("ALL")
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground font-semibold">{filteredIssues.length}</span> of {issues.length} defects
        </div>
      </div>

      {/* 5 Column Kanban Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start flex-1 min-h-[580px]">
        {COLUMNS.map((column) => {
          const colIssues = filteredIssues.filter((i) => i.status === column.id)
          const colIndex = columnOrder.indexOf(column.id)

          return (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 bg-muted/40 rounded-xl p-3 flex flex-col max-h-full border border-t-4 ${column.color} shadow-2xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${column.dot}`} />
                  <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="font-mono text-xs px-2 py-0.5">
                  {colIssues.length}
                </Badge>
              </div>

              {/* Column Issues List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 min-h-[200px]">
                {colIssues.map((issue) => (
                  <Card
                    key={issue.id}
                    onClick={() => openIssueDetails(issue)}
                    className="cursor-pointer hover:border-primary/60 hover:shadow-md transition-all duration-200 bg-card border-border/80 group"
                  >
                    <CardHeader className="p-3.5 pb-2">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-primary hover:underline">
                            {issue.key}
                          </span>
                          <IssueTypeBadge type={issue.type} />
                        </div>
                        <IssueSeverityBadge severity={issue.severity} />
                      </div>

                      <CardTitle className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {issue.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-3.5 pt-0">
                      {/* Module & Priority row */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[11px]">
                        <span className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                          {issue.module}
                        </span>
                        <IssuePriorityBadge priority={issue.priority} />
                      </div>

                      {/* Footer: Assignee & Stage Shift Buttons */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {issue.assignee ? (
                            <div className="flex items-center gap-1.5" title={`Assigned to ${issue.assignee.name}`}>
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={issue.assignee.avatar || ""} />
                                <AvatarFallback className="text-[9px]">
                                  {issue.assignee.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[11px] text-muted-foreground truncate max-w-[80px]">
                                {issue.assignee.name.split(" ")[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Unassigned</span>
                          )}

                          {issue.comments && issue.comments.length > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                              <MessageSquare className="h-3 w-3" />
                              {issue.comments.length}
                            </span>
                          )}
                        </div>

                        {/* Move between stages */}
                        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                          {colIndex > 0 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                              title={`Move back to ${COLUMNS[colIndex - 1].title}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMove(issue.id, columnOrder[colIndex - 1])
                              }}
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </Button>
                          )}
                          {colIndex < columnOrder.length - 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                              title={`Advance to ${COLUMNS[colIndex + 1].title}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMove(issue.id, columnOrder[colIndex + 1])
                              }}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {colIssues.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-border/60 rounded-lg text-muted-foreground">
                    <p className="text-xs">No defects in {column.title}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Issue Detail Drawer/Dialog */}
      <IssueDetailDialog
        issue={selectedIssue}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open)
          if (!open) setSelectedIssue(null)
        }}
        users={users}
      />
    </div>
  )
}
