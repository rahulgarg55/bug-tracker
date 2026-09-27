"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  IssueTypeBadge, 
  IssueSeverityBadge, 
  IssuePriorityBadge, 
  IssueStatusBadge 
} from "@/components/common/issue-badges"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Search, Filter, FolderKanban, MessageSquare, 
  Calendar, Tag, ExternalLink, ArrowUpDown, Layers
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
  dueDate?: Date | string | null
  createdAt: Date | string
  projectId: string
  project?: {
    id: string
    key: string
    name: string
  }
  assignee?: {
    id: string
    name: string
    avatar?: string | null
  } | null
  reporter?: {
    id: string
    name: string
    avatar?: string | null
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
  comments?: any[]
}

type GlobalIssuesViewProps = {
  initialIssues: Issue[]
  projects: Array<{ id: string; key: string; name: string }>
}

export function GlobalIssuesView({ initialIssues, projects }: GlobalIssuesViewProps) {
  const [search, setSearch] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState("ALL")
  const [selectedStatus, setSelectedStatus] = useState("ALL")
  const [selectedPriority, setSelectedPriority] = useState("ALL")
  const [selectedType, setSelectedType] = useState("ALL")

  // Parse structured search tokens (e.g. project:ACME status:TODO priority:HIGH type:BUG label:frontend)
  const filteredIssues = initialIssues.filter((issue) => {
    if (selectedProjectId !== "ALL" && issue.projectId !== selectedProjectId) return false
    if (selectedStatus !== "ALL" && issue.status !== selectedStatus) return false
    if (selectedPriority !== "ALL" && issue.priority !== selectedPriority) return false
    if (selectedType !== "ALL" && issue.type !== selectedType) return false

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      // Check query syntax tokens
      const projectMatch = q.match(/project:([a-z0-9_-]+)/)
      if (projectMatch && issue.project?.key.toLowerCase() !== projectMatch[1]) return false

      const statusMatch = q.match(/status:([a-z0-9_-]+)/)
      if (statusMatch && issue.status.toLowerCase() !== statusMatch[1]) return false

      const priorityMatch = q.match(/priority:([a-z0-9_-]+)/)
      if (priorityMatch && issue.priority.toLowerCase() !== priorityMatch[1]) return false

      const typeMatch = q.match(/type:([a-z0-9_-]+)/)
      if (typeMatch && issue.type.toLowerCase() !== typeMatch[1]) return false

      const assigneeMatch = q.match(/assignee:([a-z0-9_-]+)/)
      if (assigneeMatch && (!issue.assignee || !issue.assignee.name.toLowerCase().includes(assigneeMatch[1]))) return false

      // Strip syntax tags to get free text search
      const freeText = q
        .replace(/project:[a-z0-9_-]+/g, "")
        .replace(/status:[a-z0-9_-]+/g, "")
        .replace(/priority:[a-z0-9_-]+/g, "")
        .replace(/type:[a-z0-9_-]+/g, "")
        .replace(/assignee:[a-z0-9_-]+/g, "")
        .replace(/label:[a-z0-9_-]+/g, "")
        .trim()

      if (freeText) {
        const inKey = issue.key.toLowerCase().includes(freeText)
        const inTitle = issue.title.toLowerCase().includes(freeText)
        const inDesc = issue.description?.toLowerCase().includes(freeText) || false
        if (!inKey && !inTitle && !inDesc) return false
      }
    }

    return true
  })

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-card/70 border rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search issues or use syntax (e.g. project:PROJ status:TODO priority:CRITICAL type:BUG)...'
            className="pl-9 h-10 text-xs bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Project filter */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.key} - {p.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="BACKLOG">Backlog</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CODE_REVIEW">Code Review</option>
              <option value="QA">QA</option>
              <option value="DONE">Done</option>
            </select>

            {/* Priority filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="LOWEST">Lowest</option>
            </select>

            {/* Type filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium"
            >
              <option value="ALL">All Types</option>
              <option value="EPIC">Epic</option>
              <option value="STORY">Story</option>
              <option value="TASK">Task</option>
              <option value="BUG">Bug</option>
              <option value="FEATURE">Feature</option>
              <option value="IMPROVEMENT">Improvement</option>
            </select>

            {(search || selectedProjectId !== "ALL" || selectedStatus !== "ALL" || selectedPriority !== "ALL" || selectedType !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSearch("")
                  setSelectedProjectId("ALL")
                  setSelectedStatus("ALL")
                  setSelectedPriority("ALL")
                  setSelectedType("ALL")
                }}
              >
                Reset
              </Button>
            )}
          </div>

          <div className="text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredIssues.length}</span> of {initialIssues.length} issues
          </div>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-card border rounded-xl overflow-hidden divide-y divide-border">
        {/* Table Header */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 text-[11px] font-semibold text-muted-foreground">
          <div className="w-24 font-mono">Key</div>
          <div className="w-28">Project</div>
          <div className="w-20">Type</div>
          <div className="flex-1 min-w-[200px]">Title</div>
          <div className="w-24 text-center">Status</div>
          <div className="w-24 text-center">Priority</div>
          <div className="w-32">Assignee</div>
          <div className="w-24 text-right">Created</div>
        </div>

        {/* Rows */}
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="flex items-center gap-3 px-4 py-3 text-xs hover:bg-muted/30 transition-colors"
          >
            {/* Key */}
            <div className="w-24 font-mono font-bold text-primary">
              <Link href={`/issues/${issue.id}`} className="hover:underline flex items-center gap-1">
                {issue.key}
                <ExternalLink className="h-2.5 w-2.5 opacity-40 hover:opacity-100" />
              </Link>
            </div>

            {/* Project */}
            <div className="w-28 truncate">
              {issue.project ? (
                <Link
                  href={`/projects/${issue.project.id}`}
                  className="text-muted-foreground hover:text-foreground font-medium truncate flex items-center gap-1"
                >
                  <FolderKanban className="h-3 w-3 shrink-0" />
                  <span className="truncate">{issue.project.name}</span>
                </Link>
              ) : (
                <span className="text-muted-foreground/60">—</span>
              )}
            </div>

            {/* Type */}
            <div className="w-20">
              <IssueTypeBadge type={issue.type} />
            </div>

            {/* Title & Labels */}
            <div className="flex-1 min-w-[200px] flex items-center gap-2">
              <Link
                href={`/issues/${issue.id}`}
                className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1"
              >
                {issue.title}
              </Link>

              <div className="hidden sm:flex items-center gap-1">
                {issue.labels?.map((il, idx) => {
                  const lbl = (il as any).label || il
                  return (
                    <span
                      key={lbl.id || idx}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-medium"
                      style={{
                        backgroundColor: `${lbl.color || "#6b7280"}22`,
                        color: lbl.color || "#6b7280",
                        border: `1px solid ${lbl.color || "#6b7280"}44`,
                      }}
                    >
                      {lbl.name}
                    </span>
                  )
                })}
              </div>

              {issue.comments && issue.comments.length > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground ml-auto pr-2">
                  <MessageSquare className="h-3 w-3" />
                  {issue.comments.length}
                </span>
              )}
            </div>

            {/* Status */}
            <div className="w-24 text-center">
              <IssueStatusBadge status={issue.status} />
            </div>

            {/* Priority */}
            <div className="w-24 text-center">
              <IssuePriorityBadge priority={issue.priority} />
            </div>

            {/* Assignee */}
            <div className="w-32 flex items-center gap-1.5">
              {issue.assignee ? (
                <>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={issue.assignee.avatar || ""} />
                    <AvatarFallback className="text-[9px]">
                      {issue.assignee.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate max-w-[85px] text-[11px]">
                    {issue.assignee.name}
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground/60 italic text-[11px]">Unassigned</span>
              )}
            </div>

            {/* Created At */}
            <div className="w-24 text-right text-[11px] text-muted-foreground">
              {new Date(issue.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}

        {filteredIssues.length === 0 && (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <Layers className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">No issues match the search query</p>
            <p className="text-xs text-muted-foreground/70">Try adjusting your filters or search keywords</p>
          </div>
        )}
      </div>
    </div>
  )
}
