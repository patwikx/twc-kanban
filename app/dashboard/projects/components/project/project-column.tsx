"use client"

import { Droppable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  MoreHorizontal, 
  Settings, 
  Trash2, 
  Archive, 
  MoveVertical,
  Filter,
  SortAsc,
  Eye,
  Lock,
  AlertCircle
} from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProjectTask } from "./project-task-card"
import { CreateTaskDialog } from "./create-task-dialog"

interface ProjectColumnProps {
  column: {
    id: string
    name: string
    tasks: any[]
  }
  projectId: string
  onTaskCreated: (task: any) => void
}

export function ProjectColumn({ column, projectId, onTaskCreated }: ProjectColumnProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Calculate column statistics
  const totalTasks = column.tasks.length
  const completedTasks = column.tasks.filter(task => task.status === "DONE").length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="flex flex-col w-80 shrink-0">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="flex items-center justify-between p-3 border-b">
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{column.name}</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="text-xs hover:bg-secondary/80">
                    {totalTasks}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{completedTasks} of {totalTasks} tasks completed</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-secondary/80"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary/80">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Column Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Hide Column
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Column Settings
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <MoveVertical className="h-4 w-4 mr-2" />
                      Move Column
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>To Start</DropdownMenuItem>
                        <DropdownMenuItem>To End</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Left</DropdownMenuItem>
                        <DropdownMenuItem>Right</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem>
                    <Lock className="h-4 w-4 mr-2" />
                    Lock Column
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Column
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`p-2 min-h-[calc(100vh-16rem)] rounded-b-lg transition-colors ${
                snapshot.isDraggingOver ? "bg-accent/50" : ""
              }`}
            >
              {column.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg border-muted">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">No tasks yet</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                {column.tasks.map((task: any, index: number) => (
                  <ProjectTask
                    key={task.id}
                    task={task}
                    index={index}
                    projectId={projectId}
                  />
                ))}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectId={projectId}
        columnId={column.id}
        onTaskCreated={onTaskCreated}
      />
    </div>
  )
}