import { getProjects } from "@/app/actions/projects"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, CheckCircle2, CircleDashed, AlertCircle } from "lucide-react"

export default async function Dashboard() {
  const projects = await getProjects()
  
  const totalIssues = await prisma.issue.count()
  const todoIssues = await prisma.issue.count({ where: { status: "TODO" } })
  const inProgressIssues = await prisma.issue.count({ where: { status: "IN_PROGRESS" } })
  const doneIssues = await prisma.issue.count({ where: { status: "DONE" } })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">To Do Issues</CardTitle>
            <CircleDashed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todoIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doneIssues}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Projects</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {project.description || "No description"}
              </p>
              <div className="text-xs font-medium text-muted-foreground bg-muted inline-flex px-2 py-1 rounded-md">
                {project._count.issues} issues
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
