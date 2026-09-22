import { getProjects } from "@/app/actions/projects"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <CreateProjectDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link href={`/projects/${project.id}`} key={project.id}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FolderKanban className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{project._count.issues} issues</span>
                  <span>Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
            No projects found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  )
}
