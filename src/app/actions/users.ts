"use server"

import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const user = await prisma.user.findFirst({
    where: { email: "rahul@bugtracker.io" },
  })
  if (user) return user
  return prisma.user.findFirst()
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
  })
}
