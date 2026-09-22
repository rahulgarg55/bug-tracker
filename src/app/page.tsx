import { getProjects } from "@/app/actions/projects"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  FolderKanban, ShieldAlert, CheckCircle2, Activity, 
  ArrowRight, Bug, Sparkles, MessageSquare, Layers, Clock 
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  IssueTypeBadge, IssueSeverityBadge, IssueStatusBadge, IssuePriorityBadge 
} from "@/components/common/issue-badges"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

export default async function Dashboard() {
  const [projects, totalIssues, criticalIssues, resolvedIssues, recentIssues] = await Promise.all([
    getProjects(),
    prisma.issue.count(),
    prisma.issue.count({ where: { severity: "CRITICAL", status: { not: "CLOSED" } } }),
    prisma.issue.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.issue.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        assignee: true,
        comments: {
          select: { id: true },
        },
      },
    }),
  ])

  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0

  return (
    <div className="p-8 space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Executive Overview</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
              Live Metrics
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Zoho BugTracker & Jira centralized defect tracking and release health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="text-xs" render={<Link href="/projects" />}>
            Manage Workspaces
          </Button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Workspaces
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">{projects.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Active enterprise trackers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Critical Blockers
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-red-600">{criticalIssues}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Requiring immediate resolution</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Logged Defects
            </CardTitle>
            <Activity className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-foreground">{totalIssues}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Across all project repositories</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Org Resolution Rate
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-600">{resolutionRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">{resolvedIssues} defects closed/resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Projects Health & Recent Defect Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Project Health Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" />
              Active Project Boards
            </h2>
            <Link href="/projects" className="text-xs text-primary font-semibold hover:underline">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => {
              const total = project.issues.length
              const resolved = project.issues.filter((i) => i.status === "RESOLVED" || i.status === "CLOSED").length
              const critical = project.issues.filter((i) => i.severity === "CRITICAL" && i.status !== "CLOSED").length
              const pct = total > 0 ? Math.round((resolved / total) * 100) : 0

              return (
                <Card key={project.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {project.key}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{project.category}</span>
                    </div>
                    <CardTitle className="text-sm font-bold truncate">
                      <Link href={`/projects/${project.id}`} className="hover:text-primary transition-colors">
                        {project.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Resolution Progress</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t">
                      <span className="text-muted-foreground text-[11px]">{total} defects</span>
                      {critical > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" /> {critical} critical
                        </span>
                      )}
                      <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" render={<Link href={`/projects/${project.id}`} />}>
                        Open →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Defect Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Latest Logged Defects
            </h2>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              {recentIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/projects/${issue.projectId}`}
                  className="block p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors border border-transparent hover:border-border text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono font-bold text-primary text-[11px]">
                      {issue.key}
                    </span>
                    <IssueSeverityBadge severity={issue.severity} />
                  </div>

                  <div className="font-semibold text-foreground leading-snug truncate">
                    {issue.title}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <div className="flex items-center gap-1.5">
                      <IssueTypeBadge type={issue.type} />
                      <span>{issue.project.name}</span>
                    </div>
                    <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
