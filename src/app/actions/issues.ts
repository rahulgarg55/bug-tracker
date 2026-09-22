"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getIssues(projectId?: string) {
  return prisma.issue.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      assignee: true,
      project: true,
    },
  })
}

export async function createIssue(data: {
  title: string
  description?: string
  projectId: string
  status?: string
  priority?: string
  assigneeId?: string
}) {
  const issue = await prisma.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status || "TODO",
      priority: data.priority || "MEDIUM",
      projectId: data.projectId,
      assigneeId: data.assigneeId,
    },
  })

  revalidatePath(`/projects/${data.projectId}`)
  revalidatePath(`/projects/${data.projectId}/board`)
  return issue
}

export async function updateIssueStatus(id: string, status: string) {
  const issue = await prisma.issue.update({
    where: { id },
    data: { status },
  })
  
  revalidatePath(`/projects/${issue.projectId}`)
  revalidatePath(`/projects/${issue.projectId}/board`)
  return issue
}
