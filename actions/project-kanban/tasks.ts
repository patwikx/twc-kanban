'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export type CreateTaskInput = {
  title: string
  description?: string
  projectId: string
  columnId: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  assignedToId?: string
  dueDate?: Date | null
}

export async function createTask(input: CreateTaskInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    // Get the highest order in the column
    const lastTask = await prisma.task.findFirst({
      where: { columnId: input.columnId },
      orderBy: { order: "desc" },
      select: { order: true }
    })

    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        priority: input.priority || "MEDIUM",
        dueDate: input.dueDate,
        projectId: input.projectId,
        columnId: input.columnId,
        createdById: session.user.id,
        assignedToId: input.assignedToId,
        order: (lastTask?.order ?? -1) + 1,
        activities: {
          create: {
            type: "CREATED",
            content: "Task created",
            userId: session.user.id
          }
        }
      },
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
      }
    })

    revalidatePath(`/dashboard/projects/${input.projectId}`)
    return task
  } catch (error) {
    throw new Error("Failed to create task")
  }
}

export type UpdateTaskInput = {
  title?: string
  description?: string
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
  assignedToId?: string | null
  dueDate?: Date | null
  columnId?: string
  order?: number
}

export async function updateTask(taskId: string, projectId: string, input: UpdateTaskInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const task = await prisma.task.update({
      where: {
        id: taskId,
        projectId: projectId
      },
      data: {
        ...input,
        activities: {
          create: {
            type: "UPDATED",
            content: "Task updated",
            userId: session.user.id
          }
        }
      }
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return task
  } catch (error) {
    throw new Error("Failed to update task")
  }
}

export async function deleteTask(taskId: string, projectId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    await prisma.task.delete({
      where: {
        id: taskId,
        projectId: projectId
      }
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
  } catch (error) {
    throw new Error("Failed to delete task")
  }
}

export type CreateCommentInput = {
  content: string
  taskId: string
  projectId: string
}

export async function createComment(input: CreateCommentInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const comment = await prisma.taskComment.create({
      data: {
        content: input.content,
        taskId: input.taskId,
        userId: session.user.id
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

    // Create activity for the comment
    await prisma.taskActivity.create({
      data: {
        type: "COMMENTED",
        content: "Added a comment",
        taskId: input.taskId,
        userId: session.user.id
      }
    })

    revalidatePath(`/dashboard/projects/${input.projectId}`)
    return comment
  } catch (error) {
    throw new Error("Failed to create comment")
  }
}

export type CreateAttachmentInput = {
  name: string
  fileUrl: string
  fileType: string
  fileSize: number
  taskId: string
  projectId: string
}

export async function createAttachment(input: CreateAttachmentInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const attachment = await prisma.taskAttachment.create({
      data: {
        name: input.name,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize,
        taskId: input.taskId,
        userId: session.user.id
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

    // Create activity for the attachment
    await prisma.taskActivity.create({
      data: {
        type: "ATTACHMENT_ADDED",
        content: `Added attachment: ${input.name}`,
        taskId: input.taskId,
        userId: session.user.id
      }
    })

    revalidatePath(`/dashboard/projects/${input.projectId}`)
    return attachment
  } catch (error) {
    throw new Error("Failed to create attachment")
  }
}

export type CreateLabelInput = {
  name: string
  color: string
  taskId: string
  projectId: string
}

export async function createLabel(input: CreateLabelInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const label = await prisma.taskLabel.create({
      data: {
        name: input.name,
        color: input.color,
        taskId: input.taskId
      }
    })

    // Create activity for the label
    await prisma.taskActivity.create({
      data: {
        type: "LABEL_ADDED",
        content: `Added label: ${input.name}`,
        taskId: input.taskId,
        userId: session.user.id
      }
    })

    revalidatePath(`/dashboard/projects/${input.projectId}`)
    return label
  } catch (error) {
    throw new Error("Failed to create label")
  }
}

export async function deleteLabel(labelId: string, taskId: string, projectId: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    const label = await prisma.taskLabel.delete({
      where: {
        id: labelId,
        taskId: taskId
      }
    })

    // Create activity for removing the label
    await prisma.taskActivity.create({
      data: {
        type: "LABEL_REMOVED",
        content: `Removed label: ${label.name}`,
        taskId: taskId,
        userId: session.user.id
      }
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
  } catch (error) {
    throw new Error("Failed to delete label")
  }
}

export type UpdateTaskOrderInput = {
  tasks: {
    id: string
    columnId: string
    order: number
  }[]
  projectId: string
}

export async function updateTaskOrder(input: UpdateTaskOrderInput) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  try {
    // Update all tasks in a transaction
    await prisma.$transaction(
      input.tasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: { columnId: task.columnId, order: task.order }
        })
      )
    )

    revalidatePath(`/dashboard/projects/${input.projectId}`)
  } catch (error) {
    throw new Error("Failed to update task order")
  }
}