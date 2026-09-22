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
import { Plus } from "lucide-react"

export function CreateIssueDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createIssue({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        projectId,
        priority: formData.get("priority") as string,
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
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Issue
        </Button>
      }>
        Create Issue
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new issue</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Fix login bug" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select 
              id="priority" 
              name="priority" 
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
