import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTenantContext } from "@/lib/tenant"
import { hasPermission } from "@/lib/rbac"
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api-response"
import { z } from "zod"

const createIssueSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  type: z.string().default("BUG"),
  status: z.string().default("OPEN"),
  priority: z.string().default("MEDIUM"),
  severity: z.string().default("MODERATE"),
  module: z.string().default("General"),
  reproducibility: z.string().default("Always"),
  environment: z.string().default("Production"),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  milestoneId: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext()
    if (!tenant) return apiUnauthorized()

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get("projectId")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const severity = searchParams.get("severity")
    const search = searchParams.get("search")

    const where: any = {
      organizationId: tenant.organizationId,
    }

    if (projectId) where.projectId = projectId
    if (status && status !== "ALL") where.status = status
    if (priority && priority !== "ALL") where.priority = priority
    if (severity && severity !== "ALL") where.severity = severity
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { key: { contains: search } },
      ]
    }

    const issues = await prisma.issue.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, jobTitle: true },
        },
        reporter: {
          select: { id: true, name: true, avatar: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
        milestone: {
          select: { id: true, name: true },
        },
      },
    })

    return apiSuccess(issues)
  } catch (error: any) {
    console.error("Fetch issues error:", error)
    return apiError("Failed to fetch issues", "INTERNAL_SERVER_ERROR", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext()
    if (!tenant) return apiUnauthorized()

    // RBAC: Check permission to create issues
    if (!hasPermission(tenant.role, "issues:create")) {
      return apiForbidden("You do not have permission to create issues")
    }

    const body = await req.json()
    const parsed = createIssueSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(
        "Validation error",
        "VALIDATION_ERROR",
        400,
        parsed.error.flatten().fieldErrors
      )
    }

    const data = parsed.data

    // Verify project belongs to the tenant
    const project = await prisma.project.findFirst({
      where: {
        id: data.projectId,
        organizationId: tenant.organizationId,
      },
      include: {
        _count: { select: { issues: true } },
      },
    })

    if (!project) {
      return apiError("Project not found in this organization", "PROJECT_NOT_FOUND", 404)
    }

    const nextSeq = project._count.issues + 101
    const key = `${project.key}-${nextSeq}`

    const issue = await prisma.issue.create({
      data: {
        organizationId: tenant.organizationId,
        projectId: data.projectId,
        key,
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        priority: data.priority,
        severity: data.severity,
        module: data.module,
        reproducibility: data.reproducibility,
        environment: data.environment,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId || null,
        reporterId: tenant.userId,
        milestoneId: data.milestoneId || null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true },
        },
        reporter: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return apiSuccess(issue, 201)
  } catch (error: any) {
    console.error("Create issue error:", error)
    return apiError("Failed to create issue", "INTERNAL_SERVER_ERROR", 500)
  }
}
