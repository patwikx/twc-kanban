
import { notFound } from "next/navigation"
import { ProjectSidebar } from "../components/project/project-sidebar"
import { ProjectHeader } from "../components/project/project-header"
import { ProjectBoard } from "../components/project/project-board"
import { getProject, getProjects } from "@/actions/project-kanban/projects"

type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED" | "ON_HOLD"

interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  startDate: Date
  endDate: Date | null
  owner: {
    id: string
    firstName: string
    lastName: string
    image: string | null
  }
  members: Array<{
    id: string
    projectId: string
    userId: string
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
    joinedAt: Date
    user: {
      id: string
      firstName: string
      lastName: string
      image: string | null
    }
  }>
  boards: Array<{
    columns: Array<{
      id: string
      name: string
      tasks: Array<{
        id: string
        title: string
        description: string | null
        priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
        status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE"
        dueDate: Date | null
        order: number
        assignedTo: {
          id: string
          firstName: string
          lastName: string
          image: string | null
        } | null
      }>
    }>
  }>
}

interface ProjectPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const [project, projects] = await Promise.all([
    getProject(params.projectId),
    getProjects()
  ])

  if (!project) {
    notFound()
  }

  return (
    <div className="flex h-screen">
      <ProjectSidebar projects={projects} currentProjectId={params.projectId} />
      <div className="flex-1 flex flex-col">
        <ProjectHeader project={project} />
        <ProjectBoard project={project} />
      </div>
    </div>
  )
}