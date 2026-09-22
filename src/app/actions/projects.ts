"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          issues: true,
          milestones: true,
        },
      },
      issues: {
        select: {
          id: true,
          status: true,
          severity: true,
        },
      },
      milestones: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  })
}

export async function getProject(id: string) {
  return prisma.project.findFirst({
    where: {
      OR: [{ id }, { key: id.toUpperCase() }],
    },
    include: {
      milestones: true,
      _count: {
        select: { issues: true },
      },
    },
  })
}

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string
  const key = (formData.get("key") as string || name.slice(0, 4).toUpperCase()).trim().toUpperCase()
  const description = formData.get("description") as string
  const category = (formData.get("category") as string) || "Web Application"

  if (!name) throw new Error("Name is required")
  if (!key) throw new Error("Project Key is required")

  const project = await prisma.project.create({
    data: {
      name,
      key,
      description,
      category,
      status: "ACTIVE",
    },
  })

  revalidatePath("/projects")
  revalidatePath("/")
  return project
}
