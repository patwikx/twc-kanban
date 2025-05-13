import { getProjects } from "@/actions/project-kanban/projects"
import { CreateProjectButton } from "./projects/components/project/create-project-button"
import { ProjectCard } from "./projects/components/project/project-card"



export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize all your projects in one place
          </p>
        </div>
        <CreateProjectButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}