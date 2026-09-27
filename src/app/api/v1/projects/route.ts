import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTenantContext } from "@/lib/tenant"
import { hasPermission } from "@/lib/rbac"
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api-response"
import { z } from "zod"

const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters"),
  key: z.string().min(2).max(10).toUpperCase(),
  description: z.string().optional(),
  category: z.string().default("Web Application"),
})

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext()
    if (!tenant) return apiUnauthorized()

    const projects = await prisma.project.findMany({
      where: { organizationId: tenant.organizationId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            issues: true,
            milestones: true,
          },
        },
      },
    })

    return apiSuccess(projects)
  } catch (error: any) {
    console.error("Fetch projects error:", error)
    return apiError("Failed to fetch projects", "INTERNAL_SERVER_ERROR", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext()
    if (!tenant) return apiUnauthorized()

    // RBAC: Check permission to create project
    if (!hasPermission(tenant.role, "projects:create")) {
      return apiForbidden("You do not have permission to create projects")
    }

    const body = await req.json()
    const parsed = createProjectSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(
        "Validation error",
        "VALIDATION_ERROR",
        400,
        parsed.error.flatten().fieldErrors
      )
    }

    const { name, key, description, category } = parsed.data

    // Check key collision within the same organization
    const existing = await prisma.project.findUnique({
      where: {
        organizationId_key: {
          organizationId: tenant.organizationId,
          key,
        },
      },
    })

    if (existing) {
      return apiError(`Project key '${key}' is already in use in this workspace`, "KEY_EXISTS", 409)
    }

    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: {
          organizationId: tenant.organizationId,
          name,
          key,
          description,
          category,
          status: "ACTIVE",
        },
      })

      await tx.projectMember.create({
        data: {
          projectId: p.id,
          userId: tenant.userId,
          role: "MANAGER",
        },
      })

      return p
    })

    return apiSuccess(project, 201)
  } catch (error: any) {
    console.error("Create project error:", error)
    return apiError("Failed to create project", "INTERNAL_SERVER_ERROR", 500)
  }
}
