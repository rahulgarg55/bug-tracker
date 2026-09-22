"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateIssue, updateIssueStatus, deleteIssue, addComment } from "@/app/actions/issues"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IssueTypeBadge, IssueSeverityBadge, IssueStatusBadge, IssuePriorityBadge } from "@/components/common/issue-badges"
import { formatDistanceToNow } from "date-fns"
import { 
  Trash2, MessageSquare, Send, Calendar, Clock, 
  Layers, Monitor, RefreshCw, UserCheck, ShieldAlert 
} from "lucide-react"

type IssueWithDetails = {
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

export function IssueDetailDialog({
  issue,
  open,
  onOpenChange,
  users = [],
}: {
  issue: IssueWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  users?: Array<{ id: string; name: string; avatar: string | null; role: string }>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [commentText, setCommentText] = useState("")
  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [description, setDescription] = useState(issue?.description || "")

  if (!issue) return null

  async function handleStatusChange(newStatus: string) {
    if (!issue) return
    startTransition(async () => {
      await updateIssueStatus(issue.id, newStatus)
      router.refresh()
    })
  }

  async function handleFieldChange(field: string, value: string) {
    if (!issue) return
    startTransition(async () => {
      await updateIssue(issue.id, { [field]: value })
      router.refresh()
    })
  }

  async function handleSaveDescription() {
    if (!issue) return
    startTransition(async () => {
      await updateIssue(issue.id, { description })
      setIsEditingDesc(false)
      router.refresh()
    })
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim() || !issue) return
    startTransition(async () => {
      await addComment(issue.id, commentText)
      setCommentText("")
      router.refresh()
    })
  }

  async function handleDelete() {
    if (!issue || !confirm("Are you sure you want to delete this defect?")) return
    startTransition(async () => {
      await deleteIssue(issue.id)
      onOpenChange(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header with key, type, status bar */}
        <div className="border-b px-6 py-4 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
              {issue.key}
            </span>
            <IssueTypeBadge type={issue.type} />
            <IssueSeverityBadge severity={issue.severity} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 h-8 gap-1.5"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Main Left Column (Title, Description, Comments) */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground">
                {issue.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                <span>Created {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                {issue.reporter && (
                  <span>Reported by <strong className="text-foreground">{issue.reporter.name}</strong></span>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                  Description & Reproduction
                </Label>
                {!isEditingDesc && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditingDesc(true)}>
                    Edit
                  </Button>
                )}
              </div>

              {isEditingDesc ? (
                <div className="space-y-2">
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Provide detailed defect description and steps to reproduce..."
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingDesc(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveDescription} disabled={isPending}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/30 border text-sm whitespace-pre-wrap leading-relaxed">
                  {issue.description || <span className="italic text-muted-foreground">No description provided for this defect.</span>}
                </div>
              )}
            </div>

            {/* Environment Details Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/15 border text-xs">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Environment:</span>
                <span className="font-medium text-foreground">{issue.environment}</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Reproducibility:</span>
                <span className="font-medium text-foreground">{issue.reproducibility}</span>
              </div>
            </div>

            {/* Discussion & Comments Activity Thread */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" />
                Activity & Team Discussion ({issue.comments?.length || 0})
              </div>

              <div className="space-y-3">
                {issue.comments && issue.comments.length > 0 ? (
                  issue.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/20 border text-xs">
                      <Avatar className="h-7 w-7 mt-0.5">
                        <AvatarImage src={comment.author?.avatar || ""} />
                        <AvatarFallback>{comment.author?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {comment.author?.name}
                            <span className="ml-1.5 font-normal text-[11px] text-muted-foreground">
                              ({comment.author?.role})
                            </span>
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-foreground leading-normal whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No comments yet. Be the first to leave a note or update.</p>
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Leave a comment, investigation note, or resolution step..."
                  className="text-xs"
                />
                <Button type="submit" size="sm" className="gap-1 px-3 text-xs" disabled={isPending || !commentText.trim()}>
                  <Send className="h-3 w-3" />
                  Post
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Zoho Bug Attributes & Quick Edit Controls */}
          <div className="space-y-5 p-4 rounded-lg bg-muted/20 border">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Defect Attributes
            </h3>

            {/* Status Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <select
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isPending}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="OPEN">🔵 Open</option>
                <option value="IN_PROGRESS">🟡 In Progress</option>
                <option value="IN_REVIEW">🟣 In Review</option>
                <option value="RESOLVED">🟢 Resolved</option>
                <option value="CLOSED">⚪ Closed</option>
              </select>
            </div>

            {/* Severity Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Severity (Impact)</Label>
              <select
                value={issue.severity}
                onChange={(e) => handleFieldChange("severity", e.target.value)}
                disabled={isPending}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="CRITICAL">🚨 Critical (System Crash / Blocker)</option>
                <option value="MAJOR">⚠️ Major (High Impact Defect)</option>
                <option value="MODERATE">ℹ️ Moderate (Standard Functionality)</option>
                <option value="MINOR">🔍 Minor (Trivial / Cosmetic)</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Priority (Urgency)</Label>
              <select
                value={issue.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
                disabled={isPending}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="URGENT">🔴 Urgent</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">⚪ Low</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Assignee</Label>
              <select
                value={issue.assignee?.id || ""}
                onChange={(e) => handleFieldChange("assigneeId", e.target.value || "")}
                disabled={isPending}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Module Tag */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Module</Label>
              <select
                value={issue.module}
                onChange={(e) => handleFieldChange("module", e.target.value)}
                disabled={isPending}
                className="w-full h-8 rounded-md border border-input bg-background px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-primary"
              >
                <option value="General">General</option>
                <option value="Authentication">Authentication</option>
                <option value="Payment Engine">Payment Engine</option>
                <option value="API Gateway">API Gateway</option>
                <option value="Database & Cache">Database & Cache</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Integrations">Integrations</option>
                <option value="Ledger">Ledger</option>
              </select>
            </div>

            {/* Milestone */}
            {issue.milestone && (
              <div className="space-y-1 pt-2 border-t">
                <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Layers className="h-3 w-3" /> Milestone
                </Label>
                <div className="text-xs font-semibold text-primary">{issue.milestone.name}</div>
              </div>
            )}

            {/* Due Date */}
            {issue.dueDate && (
              <div className="space-y-1 pt-2 border-t">
                <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Target Due Date
                </Label>
                <div className="text-xs font-semibold text-foreground">
                  {new Date(issue.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
