import { getProjects } from "@/app/actions/projects"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderKanban, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Project Workspaces</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your product repositories, bug tracking boards, and release sprints.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {/* Projects Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const totalIssues = project.issues.length
          const resolvedCount = project.issues.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED").length
          const criticalCount = project.issues.filter((i) => i.severity === "CRITICAL" && i.status !== "CLOSED").length
          const progressPercent = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0

          return (
            <Card
              key={project.id}
              className="hover:border-primary/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                    {project.key}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {project.category}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-foreground hover:text-primary transition-colors">
                  <Link href={`/projects/${project.id}`}>{project.name}</Link>
                </CardTitle>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {project.description || "No description provided."}
                </p>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t">
                  <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Resolution Progress</span>
                    <span className="text-foreground font-semibold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-foreground">
                      {totalIssues} <span className="font-normal text-muted-foreground text-[11px]">defects</span>
                    </span>
                    {criticalCount > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded">
                        <ShieldAlert className="h-3 w-3" />
                        {criticalCount} critical
                      </span>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 group" render={<Link href={`/projects/${project.id}`} />}>
                    Open Board
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {projects.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <FolderKanban className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
            <p className="text-sm font-semibold">No project workspaces yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click &quot;Create Project&quot; above to initialize your first tracker.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
