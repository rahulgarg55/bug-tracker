import Link from "next/link"
import { Home, FolderKanban, Settings } from "lucide-react"
import { getCurrentUser } from "@/app/actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function Sidebar() {
  const user = await getCurrentUser()

  return (
    <aside className="w-64 border-r bg-muted/20 flex flex-col h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
          <FolderKanban className="h-6 w-6" />
          BugTracker
        </h2>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          href="/projects"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors"
        >
          <FolderKanban className="h-4 w-4" />
          Projects
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-sm font-medium text-muted-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>

      {user && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate w-[140px]">
                {user.email}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
