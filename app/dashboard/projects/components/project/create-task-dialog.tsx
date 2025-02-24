"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useToast } from "@/components/ui/use-toast"
import { createTask } from "@/actions/project-kanban/tasks"
import { 
  CalendarIcon, 
  Type, 
  AlignLeft, 
  AlertCircle, 
  ArrowDown, 
  ArrowRight, 
  ArrowUp, 
  AlertTriangle,
  Loader2,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  columnId: string
  onTaskCreated: (task: any) => void
}

const priorityConfig = {
  LOW: {
    icon: ArrowDown,
    label: "Low Priority",
    color: "text-blue-500"
  },
  MEDIUM: {
    icon: ArrowRight,
    label: "Medium Priority",
    color: "text-yellow-500"
  },
  HIGH: {
    icon: ArrowUp,
    label: "High Priority",
    color: "text-orange-500"
  },
  URGENT: {
    icon: AlertTriangle,
    label: "Urgent",
    color: "text-red-500"
  }
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  columnId,
  onTaskCreated
}: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      const newTask = await createTask({
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        priority: formData.get("priority") as any,
        projectId,
        columnId,
        dueDate: date,
      })

      onTaskCreated(newTask)
      
      toast({
        title: "Success",
        description: "Task created successfully.",
      })
      
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Create New Task
          </DialogTitle>
          <DialogDescription>
            Add a new task to your project. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                Task Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a clear, descriptive title"
                className="h-11"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Provide detailed information about the task..."
                className="min-h-[120px] resize-y"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Priority Level
                </Label>
                <Select name="priority" defaultValue="MEDIUM" disabled={loading}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {React.createElement(config.icon, {
                            className: `h-4 w-4 ${config.color}`
                          })}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !date && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Set due date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}