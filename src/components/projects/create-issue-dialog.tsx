"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createIssue } from "@/app/actions/issues"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Bug } from "lucide-react"

export function CreateIssueDialog({
  projectId,
  users = [],
  milestones = [],
}: {
  projectId: string
  users?: Array<{ id: string; name: string; role: string }>
  milestones?: Array<{ id: string; name: string }>
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createIssue({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        projectId,
        type: (formData.get("type") as string) || "BUG",
        severity: (formData.get("severity") as string) || "MODERATE",
        priority: (formData.get("priority") as string) || "MEDIUM",
        module: (formData.get("module") as string) || "General",
        environment: (formData.get("environment") as string) || "Production",
        reproducibility: (formData.get("reproducibility") as string) || "Always",
        assigneeId: (formData.get("assigneeId") as string) || undefined,
        milestoneId: (formData.get("milestoneId") as string) || undefined,
        dueDate: (formData.get("dueDate") as string) || null,
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-xs">
          <Plus className="h-4 w-4" />
          Log Bug / Issue
        </Button>
      }>
        Log Bug / Issue
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Bug className="h-5 w-5 text-red-500" />
            Submit New Defect / Issue
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Issue Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="e.g. WebSocket connection memory leak on reconnect"
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-semibold">Type</Label>
              <select
                id="type"
                name="type"
                defaultValue="BUG"
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="BUG">🐛 Bug</option>
                <option value="FEATURE">✨ Feature</option>
                <option value="TASK">📋 Task</option>
                <option value="IMPROVEMENT">⚡ Improvement</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="severity" className="text-xs font-semibold">Severity</Label>
              <select
                id="severity"
                name="severity"
                defaultValue="MODERATE"
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="CRITICAL">🚨 Critical (Crash)</option>
                <option value="MAJOR">⚠️ Major</option>
                <option value="MODERATE">ℹ️ Moderate</option>
                <option value="MINOR">🔍 Minor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority" className="text-xs font-semibold">Priority</Label>
              <select
                id="priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="URGENT">🔴 Urgent</option>
                <option value="HIGH">🟠 High</option>
                <option value="MEDIUM">🟡 Medium</option>
                <option value="LOW">⚪ Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="module" className="text-xs font-semibold">Module</Label>
              <select
                id="module"
                name="module"
                defaultValue="General"
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="General">General</option>
                <option value="Authentication">Authentication</option>
                <option value="Payment Engine">Payment Engine</option>
                <option value="API Gateway">API Gateway</option>
                <option value="Database & Cache">Database & Cache</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Integrations">Integrations</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assigneeId" className="text-xs font-semibold">Assignee</Label>
              <select
                id="assigneeId"
                name="assigneeId"
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="environment" className="text-xs font-semibold">Environment</Label>
              <Input
                id="environment"
                name="environment"
                defaultValue="Production"
                placeholder="e.g. Production (iOS Safari 17)"
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="reproducibility" className="text-xs font-semibold">Reproducibility</Label>
              <select
                id="reproducibility"
                name="reproducibility"
                defaultValue="Always"
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary"
              >
                <option value="Always">Always</option>
                <option value="Sometimes">Sometimes</option>
                <option value="Rarely">Rarely</option>
                <option value="Unable to Reproduce">Unable to Reproduce</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate" className="text-xs font-semibold">Target Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" className="h-8 text-xs" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Description, Steps to Reproduce & Expected Behavior
            </Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="1. Steps to reproduce:&#10;2. Expected behavior:&#10;3. Actual error observed:&#10;4. Stack trace / Logs:"
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Submitting Defect..." : "Submit Bug"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
