"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateIssueStatus } from "@/app/actions/issues"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  IssueTypeBadge, IssueSeverityBadge, IssueStatusBadge, IssuePriorityBadge 
} from "@/components/common/issue-badges"
import { IssueDetailDialog } from "./issue-detail-dialog"
import { Search, ArrowUpDown, MessageSquare } from "lucide-react"

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

export function IssueListView({
  issues,
  users = [],
}: {
  issues: Issue[]
  users?: Array<{ id: string; name: string; avatar: string | null; role: string }>
}) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [severityFilter, setSeverityFilter] = useState("ALL")
  const [sortBy, setSortBy] = useState<"key" | "severity" | "priority" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const router = useRouter()

  const filtered = issues
    .filter((i) => {
      if (search.trim()) {
        const q = search.toLowerCase()
        if (!i.key.toLowerCase().includes(q) && !i.title.toLowerCase().includes(q) && !i.module.toLowerCase().includes(q)) {
          return false
        }
      }
      if (statusFilter !== "ALL" && i.status !== statusFilter) return false
      if (severityFilter !== "ALL" && i.severity !== severityFilter) return false
      return true
    })
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1
      if (sortBy === "key") return a.key.localeCompare(b.key) * dir
      if (sortBy === "date") return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
      if (sortBy === "severity") {
        const order = { CRITICAL: 4, MAJOR: 3, MODERATE: 2, MINOR: 1 }
        return ((order[a.severity as keyof typeof order] || 0) - (order[b.severity as keyof typeof order] || 0)) * dir
      }
      return 0
    })

  function toggleSort(field: "key" | "severity" | "priority" | "date") {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search defects by key, summary, or module..."
              className="pl-8 h-8 text-xs bg-background"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="MAJOR">Major</option>
            <option value="MODERATE">Moderate</option>
            <option value="MINOR">Minor</option>
          </select>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-semibold">{filtered.length}</span> defects
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow>
              <TableHead className="w-[110px] cursor-pointer hover:text-foreground" onClick={() => toggleSort("key")}>
                <div className="flex items-center gap-1">
                  Key <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[90px]">Type</TableHead>
              <TableHead>Summary / Defect Title</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[110px] cursor-pointer hover:text-foreground" onClick={() => toggleSort("severity")}>
                <div className="flex items-center gap-1">
                  Severity <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead className="w-[120px]">Module</TableHead>
              <TableHead className="w-[140px]">Assignee</TableHead>
              <TableHead className="w-[100px]">Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {filtered.map((issue) => (
              <TableRow
                key={issue.id}
                onClick={() => {
                  setSelectedIssue(issue)
                  setIsDetailOpen(true)
                }}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-mono font-bold text-primary">
                  {issue.key}
                </TableCell>
                <TableCell>
                  <IssueTypeBadge type={issue.type} />
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[340px] text-foreground hover:underline">
                      {issue.title}
                    </span>
                    {issue.comments && issue.comments.length > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        <MessageSquare className="h-2.5 w-2.5" />
                        {issue.comments.length}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <IssueStatusBadge status={issue.status} />
                </TableCell>
                <TableCell>
                  <IssueSeverityBadge severity={issue.severity} />
                </TableCell>
                <TableCell>
                  <IssuePriorityBadge priority={issue.priority} />
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded bg-muted/60 text-muted-foreground text-[11px]">
                    {issue.module}
                  </span>
                </TableCell>
                <TableCell>
                  {issue.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={issue.assignee.avatar || ""} />
                        <AvatarFallback className="text-[9px]">{issue.assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="truncate max-w-[100px] text-foreground">
                        {issue.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {issue.dueDate ? (
                    new Date(issue.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                  No defects matching current criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
