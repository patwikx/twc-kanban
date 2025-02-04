"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, MessageSquare, Tag, Trash } from "lucide-react"
import { createComment, createLabel, deleteTask, updateTask } from "@/actions/project-kanban/tasks"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  projectId: string
}

export function TaskDialog({
  open,
  onOpenChange,
  taskId,
  projectId,
}: TaskDialogProps) {
  const [task, setTask] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (open && taskId) {
      fetch(`/api/projects/${projectId}/tasks/${taskId}`)
        .then((res) => res.json())
        .then((data) => {
          setTask(data)
          setDate(data.dueDate ? new Date(data.dueDate) : undefined)
        })
    }
  }, [open, taskId, projectId])

  if (!task) return null

  async function onSubmit(formData: FormData) {
    setLoading(true)
    try {
      await updateTask(taskId, projectId, {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        priority: formData.get("priority") as any,
        status: formData.get("status") as any,
        dueDate: date,
      })

      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function onDelete() {
    try {
      await deleteTask(taskId, projectId)
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function onComment(formData: FormData) {
    try {
      const comment = await createComment({
        content: formData.get("content") as string,
        taskId,
        projectId,
      })

      setTask({
        ...task,
        comments: [comment, ...task.comments],
      })

      const form = document.getElementById("comment-form") as HTMLFormElement
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  async function onAddLabel(formData: FormData) {
    try {
      const label = await createLabel({
        name: formData.get("name") as string,
        color: formData.get("color") as string,
        taskId,
        projectId,
      })

      setTask({
        ...task,
        labels: [...task.labels, label],
      })

      const form = document.getElementById("label-form") as HTMLFormElement
      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add label. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <Tabs defaultValue="details">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <form action={onSubmit} className="space-y-4">
                <Input
                  name="title"
                  defaultValue={task.title}
                  className="text-lg font-medium border-0 px-0 focus-visible:ring-0"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select name="status" defaultValue={task.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">To Do</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="REVIEW">Review</SelectItem>
                        <SelectItem value="DONE">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue={task.priority}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    name="description"
                    defaultValue={task.description || ''}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                  <div className="space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
            <div className="w-[240px] space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Labels</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.labels.map((label: any) => (
                      <Badge
                        key={label.id}
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name}
                      </Badge>
                    ))}
                  </div>
                  <form
                    id="label-form"
                    action={onAddLabel}
                    className="mt-2 space-y-2"
                  >
                    <Input
                      name="name"
                      placeholder="Label name"
                      className="h-7 text-xs"
                    />
                    <Input
                      name="color"
                      type="color"
                      className="h-7 w-full"
                    />
                    <Button type="submit" size="sm" className="w-full">
                      <Tag className="h-3 w-3 mr-1" />
                      Add Label
                    </Button>
                  </form>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Created by</Label>
                  <div className="mt-2 flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      {task.createdBy.image ? (
                        <AvatarImage
                          src={task.createdBy.image}
                          alt={`${task.createdBy.firstName} ${task.createdBy.lastName}`}
                        />
                      ) : (
                        <AvatarFallback>
                          {task.createdBy.firstName[0]}
                          {task.createdBy.lastName[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm">
                      {task.createdBy.firstName} {task.createdBy.lastName}
                    </span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Comments</Label>
                  <form
                    id="comment-form"
                    action={onComment}
                    className="mt-2 space-y-2"
                  >
                    <Textarea
                      name="content"
                      placeholder="Add a comment..."
                      className="min-h-[80px]"
                    />
                    <Button type="submit" size="sm" className="w-full">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Add Comment
                    </Button>
                  </form>
                  <ScrollArea className="h-[200px] mt-2">
                    <div className="space-y-4">
                      {task.comments.map((comment: any) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            {comment.user.image ? (
                              <AvatarImage
                                src={comment.user.image}
                                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                              />
                            ) : (
                              <AvatarFallback>
                                {comment.user.firstName[0]}
                                {comment.user.lastName[0]}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {comment.user.firstName} {comment.user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(new Date(comment.createdAt))}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}