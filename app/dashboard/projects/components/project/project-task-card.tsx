"use client"

import { Draggable } from "@hello-pangea/dnd"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  User,
  Edit,
  Trash,
  Loader,
  Save,
  AlignLeft,
  Type,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertTriangle,
  Activity,
  Circle,
  Timer,
  Eye,
  CheckCircle,
  CalendarIcon,
} from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTask } from "@/actions/project-kanban/tasks"
import { DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"

interface ProjectTaskProps {
  task: {
    id: string
    title: string
    description?: string
    dueDate?: string
    priority: keyof typeof priorityConfig
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
    _count: {
      comments: number
      attachments: number
    }
    labels: { id: string; color: string }[]
    assignedTo?: {
      image?: string
      firstName: string
      lastName: string
    }
  }
  index: number
  projectId: string
}

const priorityConfig = {
  LOW: {
    color: "bg-blue-500/10 text-blue-500",
    icon: ArrowDown,
    label: "Low Priority",
  },
  MEDIUM: {
    color: "bg-yellow-500/10 text-yellow-500",
    icon: ArrowRight,
    label: "Medium Priority",
  },
  HIGH: {
    color: "bg-orange-500/10 text-orange-500",
    icon: ArrowUp,
    label: "High Priority",
  },
  URGENT: {
    color: "bg-red-500/10 text-red-500",
    icon: AlertTriangle,
    label: "Urgent",
  },
}

const statusConfig = {
  TODO: {
    icon: Circle,
    color: "text-slate-500",
  },
  IN_PROGRESS: {
    icon: Timer,
    color: "text-blue-500",
  },
  REVIEW: {
    icon: Eye,
    color: "text-purple-500",
  },
  DONE: {
    icon: CheckCircle,
    color: "text-green-500",
  },
}

export function ProjectTask({ task, index, projectId }: ProjectTaskProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date | undefined>(task.dueDate ? new Date(task.dueDate) : undefined)


  const PriorityIcon = priorityConfig[task.priority].icon
  const StatusIcon = statusConfig[task.status].icon

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await updateTask(task.id, projectId, {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        priority: formData.get("priority") as any,
        status: formData.get("status") as any,
        dueDate: date,
      })

      toast.success("Task updated successfully")

      setIsEditing(false)
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="group relative bg-card p-3 hover:shadow-md transition-all duration-200"
          >
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none">{task.title}</h4>
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.labels.map((label) => (
                            <Badge
                              key={label.id}
                              variant="outline"
                              className="px-2 py-0.5 text-xs font-normal"
                              style={{
                                backgroundColor: `${label.color}15`,
                                color: label.color,
                                borderColor: `${label.color}30`,
                              }}
                            >
                              Test
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Task
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 break-all overflow-hidden">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge
                  variant="secondary"
                  className={cn("flex items-center gap-1", priorityConfig[task.priority].color)}
                >
                  <PriorityIcon className="h-3 w-3" />
                  <span>{task.priority}</span>
                </Badge>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{formatDate(new Date(task.dueDate))}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="flex items-center gap-1 text-xs">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{task._count?.comments || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>{task._count?.attachments || 0}</span>
                  </div>
                </div>
                {task.assignedTo ? (
                  <Avatar className="h-6 w-6 ring-2 ring-background">
                    {task.assignedTo.image ? (
                      <AvatarImage
                        src={task.assignedTo.image}
                        alt={`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                      />
                    ) : (
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {task.assignedTo.firstName[0]}
                        {task.assignedTo.lastName[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                ) : (
                  <Avatar className="h-6 w-6 bg-muted">
                    <AvatarFallback>
                      <User className="h-3 w-3 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </Card>
        )}
      </Draggable>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-muted-foreground" />
              Edit Task
            </DialogTitle>
            <DialogDescription>Make changes to your task here. Click save when you&apos;re done.</DialogDescription>
          </DialogHeader>
          <form action={onSubmit} className="space-y-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={task.title}
                  className="font-medium"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority" className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    Priority
                  </Label>
                  <Select name="priority" defaultValue={task.priority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {React.createElement(config.icon, {
                              className: `h-4 w-4 ${config.color.split(" ")[1]}`,
                            })}
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Status
                  </Label>
                  <Select name="status" defaultValue={task.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            {React.createElement(config.icon, {
                              className: `h-4 w-4 ${config.color}`,
                            })}
                            {key
                              .split("_")
                              .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                              .join(" ")}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <AlignLeft className="h-4 w-4 text-muted-foreground" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={task.description}
                  className="min-h-[100px] resize-y"
                  placeholder="Add a more detailed description..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button type="button" variant="destructive" size="sm" className="gap-2">
                <Trash className="h-4 w-4" />
                Delete Task
              </Button>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

