"use server"

import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  // Mock authentication - just return the dummy user we created in seed
  return prisma.user.findFirst()
}
