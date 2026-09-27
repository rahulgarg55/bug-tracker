"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  MessageSquare, Calendar, ShieldAlert, Tag, ExternalLink, GripVertical
} from "lucide-react"

type Issue = {
  id: string
  key: string
  title: string
  description: string | null
  type: string
  status: string
  priority: string
  severity?: string | null
  module?: string
  reproducibility?: string
  environment?: string
  dueDate?: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  projectId: string
  assignee?: {
    id: string
    name: string
    avatar?: string | null
    role?: string
  } | null
  reporter?: {
    id: string
    name: string
    avatar?: string | null
  } | null
  milestone?: {
    id: string
    name: string
  } | null
  labels?: Array<{
    id?: string
    name?: string
    color?: string
    label?: {
      id: string
      name: string
      color: string
    }
  }>
  comments?: Array<{
    id: string
    content: string
    createdAt: Date | string
    author: {
      name: string
      avatar?: string | null
      role?: string
    }
  }>
}

const COLUMNS = [
  { id: "BACKLOG", title: "Backlog", color: "border-t-slate-400", dot: "bg-slate-400" },
  { id: "TODO", title: "To Do", color: "border-t-blue-500", dot: "bg-blue-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-t-amber-500", dot: "bg-amber-500" },
  { id: "CODE_REVIEW", title: "Code Review", color: "border-t-purple-500", dot: "bg-purple-500" },
  { id: "QA", title: "QA", color: "border-t-cyan-500", dot: "bg-cyan-500" },
  { id: "DONE", title: "Done", color: "border-t-emerald-500", dot: "bg-emerald-500" },
]

function normalizeStatus(status: string): string {
  switch (status) {
    case "OPEN":
      return "TODO"
    case "IN_REVIEW":
      return "CODE_REVIEW"
    case "RESOLVED":
    case "CLOSED":
      return "DONE"
    default:
      return status
  }
}

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
  const [draggingIssueId, setDraggingIssueId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  
  // Filters
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("ALL")
  const [filterSeverity, setFilterSeverity] = useState("ALL")
  const [filterPriority, setFilterPriority] = useState("ALL")
  const [filterAssignee, setFilterAssignee] = useState("ALL")

  const router = useRouter()
  const columnOrder = COLUMNS.map((c) => c.id)

  async function handleMove(issueId: string, newStatus: string) {
    // Optimistic update
    setIssues((current) =>
      current.map((issue) =>
        issue.id === issueId ? { ...issue, status: newStatus } : issue
      )
    )

    try {
      await updateIssueStatus(issueId, newStatus)
      router.refresh()
    } catch (err) {
      console.error("Failed to update status on server:", err)
    }
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
    if (filterAssignee !== "ALL") {
      if (filterAssignee === "UNASSIGNED" && issue.assignee) return false
      if (filterAssignee !== "UNASSIGNED" && issue.assignee?.id !== filterAssignee) return false
    }
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
              placeholder="Filter by key, title, keyword..."
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
            <option value="STORY">📖 Story</option>
            <option value="EPIC">⚡ Epic</option>
            <option value="FEATURE">✨ Feature</option>
            <option value="IMPROVEMENT">🚀 Improvement</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">🔴 Critical</option>
            <option value="HIGH">🟠 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">⚪ Low</option>
            <option value="LOWEST">⚪ Lowest</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Assignees</option>
            <option value="UNASSIGNED">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {(search || filterType !== "ALL" || filterSeverity !== "ALL" || filterPriority !== "ALL" || filterAssignee !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("")
                setFilterType("ALL")
                setFilterSeverity("ALL")
                setFilterPriority("ALL")
                setFilterAssignee("ALL")
              }}
            >
              Reset Filters
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground font-semibold">{filteredIssues.length}</span> of {issues.length} issues
        </div>
      </div>

      {/* 6 Column Kanban Grid */}
      <div className="flex gap-4 overflow-x-auto pb-4 items-start flex-1 min-h-[600px]">
        {COLUMNS.map((column) => {
          const colIssues = filteredIssues.filter((i) => normalizeStatus(i.status) === column.id)
          const colIndex = columnOrder.indexOf(column.id)
          const isOver = dragOverColumn === column.id

          return (
            <div
              key={column.id}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = "move"
                if (dragOverColumn !== column.id) setDragOverColumn(column.id)
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return
                setDragOverColumn(null)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverColumn(null)
                const droppedIssueId = e.dataTransfer.getData("text/plain") || draggingIssueId
                if (droppedIssueId) {
                  handleMove(droppedIssueId, column.id)
                }
                setDraggingIssueId(null)
              }}
              className={`flex-shrink-0 w-80 bg-muted/40 rounded-xl p-3 flex flex-col max-h-full border border-t-4 ${column.color} shadow-2xs transition-all duration-150 ${
                isOver ? "ring-2 ring-primary ring-offset-2 bg-primary/10" : ""
              }`}
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
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 min-h-[220px]">
                {colIssues.map((issue) => (
                  <Card
                    key={issue.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", issue.id)
                      setDraggingIssueId(issue.id)
                    }}
                    onDragEnd={() => {
                      setDraggingIssueId(null)
                      setDragOverColumn(null)
                    }}
                    onClick={() => openIssueDetails(issue)}
                    className={`cursor-pointer hover:border-primary/60 hover:shadow-md transition-all duration-200 bg-card border-border/80 group ${
                      draggingIssueId === issue.id ? "opacity-50 ring-1 ring-primary" : ""
                    }`}
                  >
                    <CardHeader className="p-3.5 pb-2">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors cursor-grab" />
                          <Link
                            href={`/issues/${issue.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-mono text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                          >
                            {issue.key}
                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <IssueTypeBadge type={issue.type} />
                        </div>
                        {issue.severity && <IssueSeverityBadge severity={issue.severity} />}
                      </div>

                      <CardTitle className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {issue.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-3.5 pt-0">
                      {/* Labels and Priority Row */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2 pt-2 border-t border-border/50 text-[11px]">
                        <div className="flex flex-wrap items-center gap-1">
                          {issue.labels?.map((il, idx) => {
                            const lbl = (il as any).label || il
                            return (
                              <span
                                key={lbl.id || idx}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${lbl.color || "#6b7280"}22`,
                                  color: lbl.color || "#6b7280",
                                  border: `1px solid ${lbl.color || "#6b7280"}44`,
                                }}
                              >
                                <Tag className="h-2.5 w-2.5" />
                                {lbl.name}
                              </span>
                            )
                          })}
                        </div>
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
                    <p className="text-xs">No issues in {column.title}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Drag an issue here</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Issue Detail Drawer/Dialog */}
      <IssueDetailDialog
        issue={selectedIssue as any}
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
