"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function getUsers() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
      },
      orderBy: {
        firstName: 'asc'
      }
    })

    return users
  } catch (error) {
    throw new Error("Failed to fetch users")
  }
}