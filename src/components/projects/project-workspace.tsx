"use client"

import { useState } from "react"
import { KanbanBoard } from "./kanban-board"
import { IssueListView } from "./issue-list-view"
import { AnalyticsView } from "./analytics-view"
import { IntegrationsView } from "./integrations-view"
import { CreateIssueDialog } from "./create-issue-dialog"
import { 
  Kanban, ListOrdered, BarChart3, 
  Workflow, ShieldAlert, CheckCircle2 
} from "lucide-react"

type ProjectWorkspaceProps = {
  project: {
    id: string
    name: string
    key: string
    description: string | null
    category: string
    milestones: Array<{ id: string; name: string }>
  }
  issues: any[]
  users: any[]
  analytics: any
}

export function ProjectWorkspace({ project, issues, users, analytics }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"board" | "list" | "analytics" | "integrations">("board")

  return (
    <div className="flex flex-col h-full">
      {/* Secondary Project Toolbar with Tabs and Quick Create */}
      <div className="border-b px-8 py-2.5 bg-background/80 backdrop-blur-xs flex items-center justify-between gap-4 sticky top-0 z-20">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
          <button
            onClick={() => setActiveTab("board")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "board"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            Kanban Board
            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded">
              {issues.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "list"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            Issue Navigator
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "analytics"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Reports & Velocity
          </button>

          <button
            onClick={() => setActiveTab("integrations")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "integrations"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Workflow className="h-3.5 w-3.5" />
            Zoho / Jira Integrations
          </button>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <CreateIssueDialog
            projectId={project.id}
            users={users}
            milestones={project.milestones}
          />
        </div>
      </div>

      {/* Main Tab Content View */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === "board" && (
          <KanbanBoard projectId={project.id} initialIssues={issues} users={users} />
        )}
        {activeTab === "list" && (
          <IssueListView issues={issues} users={users} />
        )}
        {activeTab === "analytics" && (
          <AnalyticsView data={analytics} />
        )}
        {activeTab === "integrations" && (
          <IntegrationsView />
        )}
      </div>
    </div>
  )
}
