"use client"

import { useCallback, useState } from "react"
import { DragDropContext } from "@hello-pangea/dnd"

import { useToast } from "@/components/ui/use-toast"
import { ProjectColumn } from "./project-column"
import { updateTaskOrder } from "@/actions/project-kanban/tasks"

interface Task {
  id: string
  order: number
  columnId: string
  [key: string]: any // For other task properties
}

interface Column {
  id: string
  name: string
  tasks: Task[]
  [key: string]: any // For other column properties
}

interface ProjectBoardProps {
  project: {
    id: string
    boards: {
      columns: Column[]
    }[]
  }
}

export function ProjectBoard({ project }: ProjectBoardProps) {
  const [columns, setColumns] = useState<Column[]>(project.boards[0].columns)
  const { toast } = useToast()

  const onDragEnd = useCallback(async (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    if (sourceColumn.id === destColumn.id) {
      const newTasks = Array.from(sourceColumn.tasks)
      const [removed] = newTasks.splice(source.index, 1)
      newTasks.splice(destination.index, 0, removed)

      const newColumn = {
        ...sourceColumn,
        tasks: newTasks.map((task, index) => ({ ...task, order: index }))
      }

      setColumns(
        columns.map((column) =>
          column.id === newColumn.id ? newColumn : column
        )
      )

      try {
        await updateTaskOrder({
          tasks: newTasks.map((task, index) => ({
            id: task.id,
            columnId: sourceColumn.id,
            order: index
          })),
          projectId: project.id
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update task order. Please try again.",
          variant: "destructive"
        })
      }
    } else {
      const sourceTasks = Array.from(sourceColumn.tasks)
      const destTasks = Array.from(destColumn.tasks)
      const [removed] = sourceTasks.splice(source.index, 1)
      destTasks.splice(destination.index, 0, removed)

      const newSourceColumn = {
        ...sourceColumn,
        tasks: sourceTasks.map((task, index) => ({ ...task, order: index }))
      }

      const newDestColumn = {
        ...destColumn,
        tasks: destTasks.map((task, index) => ({ ...task, order: index }))
      }

      setColumns(
        columns.map((column) => {
          if (column.id === newSourceColumn.id) return newSourceColumn
          if (column.id === newDestColumn.id) return newDestColumn
          return column
        })
      )

      try {
        await updateTaskOrder({
          tasks: [
            ...sourceTasks.map((task, index) => ({
              id: task.id,
              columnId: sourceColumn.id,
              order: index
            })),
            ...destTasks.map((task, index) => ({
              id: task.id,
              columnId: destColumn.id,
              order: index
            }))
          ],
          projectId: project.id
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update task order. Please try again.",
          variant: "destructive"
        })
      }
    }
  }, [columns, project.id, toast])

  const handleTaskCreated = useCallback((newTask: Task) => {
    setColumns(prevColumns => 
      prevColumns.map(column => {
        if (column.id === newTask.columnId) {
          return {
            ...column,
            tasks: [...column.tasks, newTask]
          }
        }
        return column
      })
    )
  }, [])
  
  const handleTaskEdited = useCallback((newTask: Task) => {
    setColumns(prevColumns => 
      prevColumns.map(column => {
        if (column.id === newTask.columnId) {
          return {
            ...column,
            tasks: [...column.tasks, newTask]
          }
        }
        return column
      })
    )
  }, [])

  return (
    <div className="flex-1 overflow-auto bg-muted/20 p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="container flex h-full gap-4">
          {columns.map((column) => (
            <ProjectColumn
              key={column.id}
              column={column}
              projectId={project.id}
              onTaskCreated={handleTaskCreated}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}