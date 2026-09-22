"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { issues: true },
      },
    },
  })
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
  })
}

export async function createProject(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name) throw new Error("Name is required")

  const project = await prisma.project.create({
    data: { name, description },
  })

  revalidatePath("/projects")
  return project
}
