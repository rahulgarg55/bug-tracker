import Link from "next/link"
import { 
  Home, FolderKanban, Plus, Workflow, Settings 
} from "lucide-react"
import { getProjects } from "@/app/actions/projects"
import { getCurrentUserWithOrgs, getTenantContext } from "@/lib/tenant"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { OrgSwitcher } from "./org-switcher"
import { TeamMembersDialog } from "./team-members-dialog"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"

export async function Sidebar() {
  const [userWithOrgs, tenant, projects] = await Promise.all([
    getCurrentUserWithOrgs(),
    getTenantContext(),
    getProjects(),
  ])

  if (!userWithOrgs || !tenant) return null

  const organizations = userWithOrgs.memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    role: m.role,
  }))

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-md flex flex-col h-screen select-none">
      {/* Workspace / Organization Switcher Header */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-black text-xs shadow-xs">
              ZT
            </div>
            <span className="text-xs font-black tracking-tight text-foreground">
              Zoho BugTracker
            </span>
          </Link>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
            SaaS
          </span>
        </div>

        <OrgSwitcher organizations={organizations} activeOrgId={tenant.organizationId} />
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Workspace
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
            Projects
            <span className="ml-auto font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded font-bold">
              {projects.length}
            </span>
          </Link>

          {/* Members & Teams Modal */}
          <TeamMembersDialog
            organizationId={tenant.organizationId}
            organizationName={tenant.organization.name}
            currentUserRole={tenant.role}
          />
        </div>

        {/* Workspace Projects Quick Switcher */}
        <div className="space-y-1">
          <div className="px-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            <span>Projects</span>
            <CreateProjectDialog />
          </div>

          <div className="space-y-0.5">
            {projects.map((p) => {
              const criticalCount = p.issues.filter(
                (i) => i.severity === "CRITICAL" && i.status !== "CLOSED"
              ).length

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
                    <span
                      className="ml-auto h-2 w-2 rounded-full bg-red-500"
                      title={`${criticalCount} critical defect(s)`}
                    />
                  )}
                </Link>
              )
            })}
            {projects.length === 0 && (
              <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
                No projects in this workspace
              </div>
            )}
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="space-y-1">
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Administration
          </div>
          <Link
            href="/settings/profile"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted text-foreground transition-colors"
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            Workspace Settings
          </Link>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t bg-muted/20 space-y-2">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={tenant.user.avatar || ""} />
            <AvatarFallback className="text-xs font-bold">{tenant.user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-foreground truncate">{tenant.user.name}</span>
            <span className="text-[10px] text-muted-foreground truncate">
              {tenant.user.jobTitle || "Engineer"} • <span className="font-semibold text-primary">{tenant.role}</span>
            </span>
          </div>
        </div>
        <form
          action={async () => {
            "use server"
            const { signOut } = await import("@/auth")
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button
            type="submit"
            className="w-full text-left px-2 py-1.5 text-xs text-red-500 hover:bg-red-500/10 rounded-md font-semibold transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
