'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export type AddMemberInput = {
  projectId: string
  userId: string
  role?: "ADMIN" | "MEMBER" | "VIEWER"
}

export async function addMember(input: AddMemberInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const member = await prisma.projectMember.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        role: input.role || "MEMBER"
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true
          }
        }
      }
    })

    revalidatePath(`/projects/${input.projectId}`)
    return member
  } catch (error) {
    throw new Error("Failed to add member")
  }
}

export type UpdateMemberRoleInput = {
  projectId: string
  userId: string
  role: "ADMIN" | "MEMBER" | "VIEWER"
}

export async function updateMemberRole(input: UpdateMemberRoleInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const member = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId: input.projectId,
          userId: input.userId
        }
      },
      data: {
        role: input.role
      }
    })

    revalidatePath(`/projects/${input.projectId}`)
    return member
  } catch (error) {
    throw new Error("Failed to update member role")
  }
}

export async function removeMember(projectId: string, userId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId
        }
      }
    })

    revalidatePath(`/projects/${projectId}`)
  } catch (error) {
    throw new Error("Failed to remove member")
  }
}