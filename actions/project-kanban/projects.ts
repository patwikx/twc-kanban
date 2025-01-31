"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type CreateProjectInput = {
  name: string
  description?: string
  startDate: Date
  endDate?: Date | null
}

export async function createProject(input: CreateProjectInput) {
  console.log("Creating project with input:", input)
  
  const session = await auth()
  if (!session?.user) {
    console.log("No session found")
    throw new Error("Unauthorized")
  }

  console.log("Session user:", session.user)

  try {
    const project = await prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER"
          }
        },
        boards: {
          create: {
            name: "Main Board",
            order: 0,
            columns: {
              createMany: {
                data: [
                  { name: "To Do", order: 0 },
                  { name: "In Progress", order: 1 },
                  { name: "Review", order: 2 },
                  { name: "Done", order: 3 }
                ]
              }
            }
          }
        }
      }
    })

    console.log("Created project:", project)
    revalidatePath("/projects")
    return project
  } catch (error) {
    console.error("Create project error:", error)
    if (error instanceof Error) {
      throw new Error(`Failed to create project: ${error.message}`)
    }
    throw new Error("Failed to create project")
  }
}


export async function getProjects() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true
          }
        },
        members: {
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
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return projects
  } catch (error) {
    throw new Error("Failed to fetch projects")
  }
}

export async function getProject(projectId: string) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        OR: [
          { ownerId: session.user.id },
          {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true
          }
        },
        members: {
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
        },
        boards: {
          include: {
            columns: {
              include: {
                tasks: {
                  include: {
                    assignedTo: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        image: true
                      }
                    },
                    labels: true,
                    _count: {
                      select: {
                        comments: true,
                        attachments: true
                      }
                    }
                  },
                  orderBy: {
                    order: "asc"
                  }
                }
              },
              orderBy: {
                order: "asc"
              }
            }
          },
          orderBy: {
            order: "asc"
          }
        }
      }
    })

    if (!project) {
      throw new Error("Project not found")
    }

    return project
  } catch (error) {
    throw new Error("Failed to fetch project")
  }
}

export type UpdateProjectInput = {
  name?: string
  description?: string
  status?: "ACTIVE" | "COMPLETED" | "ARCHIVED" | "ON_HOLD"
  startDate?: Date
  endDate?: Date | null
}

export async function updateProject(projectId: string, input: UpdateProjectInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const project = await prisma.project.update({
      where: {
        id: projectId,
        ownerId: session.user.id
      },
      data: input
    })

    revalidatePath(`/projects/${projectId}`)
    return project
  } catch (error) {
    throw new Error("Failed to update project")
  }
}

export async function deleteProject(projectId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.project.delete({
      where: {
        id: projectId,
        ownerId: session.user.id
      }
    })

    revalidatePath("/projects")
    redirect("/projects")
  } catch (error) {
    throw new Error("Failed to delete project")
  }
}