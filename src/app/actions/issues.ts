"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "./users"
import { getTenantContext, requireTenantContext } from "@/lib/tenant"
import { hasPermission } from "@/lib/rbac"

export type IssueFilters = {
  status?: string
  priority?: string
  severity?: string
  type?: string
  assigneeId?: string
  module?: string
  search?: string
}

export async function getIssues(projectId?: string, filters?: IssueFilters) {
  const tenant = await getTenantContext()
  if (!tenant) return []

  const whereClause: any = {
    organizationId: tenant.organizationId,
  }

  if (projectId) {
    whereClause.projectId = projectId
  }

  if (filters) {
    if (filters.status && filters.status !== "ALL") {
      whereClause.status = filters.status
    }
    if (filters.priority && filters.priority !== "ALL") {
      whereClause.priority = filters.priority
    }
    if (filters.severity && filters.severity !== "ALL") {
      whereClause.severity = filters.severity
    }
    if (filters.type && filters.type !== "ALL") {
      whereClause.type = filters.type
    }
    if (filters.assigneeId && filters.assigneeId !== "ALL") {
      whereClause.assigneeId = filters.assigneeId
    }
    if (filters.module && filters.module !== "ALL") {
      whereClause.module = filters.module
    }
    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { key: { contains: filters.search } },
      ]
    }
  }

  return prisma.issue.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      assignee: true,
      reporter: true,
      project: true,
      milestone: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export async function getIssueById(id: string) {
  const tenant = await getTenantContext()
  if (!tenant) return null

  return prisma.issue.findFirst({
    where: {
      id,
      organizationId: tenant.organizationId,
    },
    include: {
      assignee: true,
      reporter: true,
      project: true,
      milestone: true,
      comments: {
        include: {
          author: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export async function createIssue(data: {
  title: string
  description?: string
  projectId: string
  type?: string
  status?: string
  priority?: string
  severity?: string
  module?: string
  environment?: string
  reproducibility?: string
  assigneeId?: string
  milestoneId?: string
  dueDate?: string | null
}) {
  const tenant = await requireTenantContext()

  if (!hasPermission(tenant.role, "issues:create")) {
    throw new Error("Forbidden: You do not have permission to create issues")
  }

  // Find project within this organization to get its key prefix
  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      organizationId: tenant.organizationId,
    },
    include: {
      _count: {
        select: { issues: true },
      },
    },
  })

  if (!project) throw new Error("Project not found in this workspace")

  // Generate next issue key (e.g., CLOUD-106)
  const count = project._count.issues + 101
  const key = `${project.key}-${count}`

  const issue = await prisma.issue.create({
    data: {
      organizationId: tenant.organizationId,
      projectId: data.projectId,
      key,
      title: data.title,
      description: data.description,
      type: data.type || "BUG",
      status: data.status || "OPEN",
      priority: data.priority || "MEDIUM",
      severity: data.severity || "MODERATE",
      module: data.module || "General",
      environment: data.environment || "Production",
      reproducibility: data.reproducibility || "Always",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: data.assigneeId || null,
      reporterId: tenant.userId,
      milestoneId: data.milestoneId || null,
    },
  })

  revalidatePath(`/projects/${data.projectId}`)
  revalidatePath(`/projects`)
  revalidatePath(`/`)
  return issue
}

export async function updateIssue(
  id: string,
  data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    severity?: string
    module?: string
    environment?: string
    reproducibility?: string
    assigneeId?: string | null
    milestoneId?: string | null
    dueDate?: string | null
  }
) {
  const tenant = await requireTenantContext()

  if (!hasPermission(tenant.role, "issues:edit")) {
    throw new Error("Forbidden: You do not have permission to edit issues")
  }

  const existing = await prisma.issue.findFirst({
    where: { id, organizationId: tenant.organizationId },
  })

  if (!existing) throw new Error("Issue not found in this workspace")

  const updateData: any = { ...data }
  if (data.dueDate !== undefined) {
    updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
  }

  const issue = await prisma.issue.update({
    where: { id },
    data: updateData,
  })

  revalidatePath(`/projects/${issue.projectId}`)
  revalidatePath(`/projects`)
  revalidatePath(`/`)
  return issue
}

export async function updateIssueStatus(id: string, status: string) {
  const tenant = await requireTenantContext()

  if (!hasPermission(tenant.role, "issues:edit")) {
    throw new Error("Forbidden: You do not have permission to update issue status")
  }

  const existing = await prisma.issue.findFirst({
    where: { id, organizationId: tenant.organizationId },
  })

  if (!existing) throw new Error("Issue not found in this workspace")

  const issue = await prisma.issue.update({
    where: { id },
    data: { status },
  })

  revalidatePath(`/projects/${issue.projectId}`)
  revalidatePath(`/projects`)
  revalidatePath(`/`)
  return issue
}

export async function deleteIssue(id: string) {
  const tenant = await requireTenantContext()

  if (!hasPermission(tenant.role, "issues:delete")) {
    throw new Error("Forbidden: You do not have permission to delete issues")
  }

  const existing = await prisma.issue.findFirst({
    where: { id, organizationId: tenant.organizationId },
  })

  if (!existing) throw new Error("Issue not found in this workspace")

  const issue = await prisma.issue.delete({
    where: { id },
  })

  revalidatePath(`/projects/${issue.projectId}`)
  revalidatePath(`/projects`)
  revalidatePath(`/`)
  return issue
}

export async function addComment(issueId: string, content: string) {
  const tenant = await requireTenantContext()

  if (!content.trim()) throw new Error("Comment content cannot be empty")

  const issue = await prisma.issue.findFirst({
    where: { id: issueId, organizationId: tenant.organizationId },
    select: { projectId: true },
  })

  if (!issue) throw new Error("Issue not found in this workspace")

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      issueId,
      authorId: tenant.userId,
    },
    include: {
      author: true,
    },
  })

  revalidatePath(`/projects/${issue.projectId}`)
  return comment
}
