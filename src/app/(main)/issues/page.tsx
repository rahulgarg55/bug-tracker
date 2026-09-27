import { getIssues } from "@/app/actions/issues"
import { getProjects } from "@/app/actions/projects"
import { GlobalIssuesView } from "@/components/issues/global-issues-view"
import { ListOrdered, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function GlobalIssuesPage() {
  const [issues, projects] = await Promise.all([
    getIssues(),
    getProjects(),
  ])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b px-8 py-4 flex flex-wrap items-center justify-between gap-4 bg-card/70">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <ListOrdered className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Global Issues Navigator</h1>
            <p className="text-xs text-muted-foreground">
              Search and filter issues across all projects in your organization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" render={<Link href="/projects" />}>
            Go to Projects
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <GlobalIssuesView
          initialIssues={issues as any}
          projects={projects.map((p) => ({ id: p.id, key: p.key, name: p.name }))}
        />
      </div>
    </div>
  )
}
