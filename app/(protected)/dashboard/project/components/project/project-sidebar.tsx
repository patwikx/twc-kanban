"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CreateProjectButton } from "./create-project-button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock, 
  CheckCircle2, 
  Archive, 
  PauseCircle, 
  ChevronRight, 
  LayoutGrid, 
  Search,
  Plus,
  Settings,
  Filter,
  FolderKanban
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "ON_HOLD"

interface Project {
  id: string
  name: string
  status: ProjectStatus
  _count: {
    tasks: number
  }
}

interface ProjectSidebarProps {
  projects: Project[]
  currentProjectId: string
}

export function ProjectSidebar({ projects = [], currentProjectId }: ProjectSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const statusIcons: Record<ProjectStatus, typeof Clock> = {
    ACTIVE: Clock,
    COMPLETED: CheckCircle2,
    ARCHIVED: Archive,
    ON_HOLD: PauseCircle
  }

  const statusColors: Record<ProjectStatus, string> = {
    ACTIVE: "text-emerald-500",
    COMPLETED: "text-blue-500",
    ARCHIVED: "text-gray-500",
    ON_HOLD: "text-amber-500"
  }

  // Initialize groupedProjects with all possible statuses
  const initialGroupedProjects: Record<ProjectStatus, Project[]> = {
    ACTIVE: [],
    COMPLETED: [],
    ARCHIVED: [],
    ON_HOLD: []
  }

  // Group projects by status
  const groupedProjects = projects.reduce((acc, project) => {
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return acc
    }
    acc[project.status].push(project)
    return acc
  }, initialGroupedProjects)

  const statusOrder: ProjectStatus[] = ["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]

  return (
    <div className="w-80 border-r bg-card flex flex-col h-screen">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Projects</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <CreateProjectButton />
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {statusOrder.map((status) => {
            if (!groupedProjects[status]?.length) return null
            const StatusIcon = statusIcons[status]
            
            return (
              <div key={status} className="mb-4">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <StatusIcon className={cn("w-4 h-4", statusColors[status])} />
                  <span className="text-xs font-medium text-muted-foreground">
                    {status.replace("_", " ")}
                  </span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {groupedProjects[status].length}
                  </Badge>
                </div>
                <div className="mt-1 space-y-1">
                  {groupedProjects[status].map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/project/${project.id}`}
                      className={cn(
                        "group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        project.id === currentProjectId && "bg-accent text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 p-1 min-w-0">
                          <p className="font-medium leading-none">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {project._count.tasks} {project._count.tasks === 1 ? 'task' : 'tasks'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
                <Separator className="my-2" />
              </div>
            )
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-card/50 backdrop-blur-sm">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}