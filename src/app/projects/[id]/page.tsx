import { getProject } from "@/app/actions/projects"
import { getIssues } from "@/app/actions/issues"
import { KanbanBoard } from "@/components/projects/kanban-board"
import { CreateIssueDialog } from "@/components/projects/create-issue-dialog"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  
  if (!project) {
    notFound()
  }

  const issues = await getIssues(project.id)

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-8 py-4 flex items-center gap-4 bg-background z-10 sticky top-0">
        <Button variant="ghost" size="icon" render={<Link href="/projects" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        <div className="ml-auto">
          <CreateIssueDialog projectId={project.id} />
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto p-8">
        <KanbanBoard projectId={project.id} initialIssues={issues} />
      </div>
    </div>
  )
}
