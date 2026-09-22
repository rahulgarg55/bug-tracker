import Link from "next/link"
import { 
  Home, FolderKanban, Settings, 
  Workflow, BarChart3, Plus, ShieldAlert 
} from "lucide-react"
import { getCurrentUser } from "@/app/actions/users"
import { getProjects } from "@/app/actions/projects"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function Sidebar() {
  const [user, projects] = await Promise.all([
    getCurrentUser(),
    getProjects(),
  ])

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-md flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm shadow-sm">
            ZB
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-foreground flex items-center gap-1.5">
              Zoho BugTracker
            </div>
            <div className="text-[10px] font-semibold text-primary uppercase tracking-widest">
              Enterprise Pro
            </div>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Overview
          </div>
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            Executive Dashboard
          </Link>
          <Link
            href="/projects"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors"
          >
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
            All Projects
            <span className="ml-auto font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded font-bold">
              {projects.length}
            </span>
          </Link>
        </div>

        {/* Workspace Projects Quick Switcher */}
        <div className="space-y-1">
          <div className="px-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            <span>Workspaces</span>
            <Link href="/projects" className="hover:text-primary" title="View all">
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-0.5">
            {projects.map((p) => {
              const criticalCount = p.issues.filter((i) => i.severity === "CRITICAL" && i.status !== "CLOSED").length

              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-muted transition-colors group"
                >
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {p.key}
                  </span>
                  <span className="truncate text-foreground max-w-[120px]">{p.name}</span>
                  {criticalCount > 0 && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-red-500" title={`${criticalCount} critical defect(s)`} />
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Integration Shortcuts */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Ecosystem
          </div>
          {projects.length > 0 && (
            <Link
              href={`/projects/${projects[0].id}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors"
            >
              <Workflow className="h-4 w-4 text-muted-foreground" />
              Zoho / Jira Sync
            </Link>
          )}
        </div>
      </div>

      {/* User Footer Profile */}
      {user && (
        <div className="p-3 border-t bg-muted/20">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Avatar className="h-8 w-8 border border-border">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="text-xs font-bold">{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{user.name}</span>
              <span className="text-[10px] text-muted-foreground truncate">{user.role}</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
