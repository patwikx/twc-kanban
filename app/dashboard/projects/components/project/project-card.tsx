import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils/format"
import { CalendarDays, CheckCircle2, Clock, LayoutGrid } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string | null
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED" | "ON_HOLD"
    startDate: Date
    endDate?: Date | null
    owner: {
      firstName: string
      lastName: string
      image?: string | null
    }
    _count: {
      tasks: number
    }
    members: {
      user: {
        firstName: string
        lastName: string
        image?: string | null
      }
    }[]
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig = {
    ACTIVE: {
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: Clock
    },
    COMPLETED: {
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: CheckCircle2
    },
    ARCHIVED: {
      color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      icon: LayoutGrid
    },
    ON_HOLD: {
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: Clock
    }
  }

  const StatusIcon = statusConfig[project.status].icon

  // Calculate days remaining or days overdue
  const today = new Date()
  const endDate = project.endDate ? new Date(project.endDate) : null
  const daysRemaining = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null
  const progress = Math.min(100, Math.max(0, Math.random() * 100)) // Replace with actual progress calculation

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-semibold tracking-tight">
                {project.name}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {project.description || "No description provided"}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${statusConfig[project.status].color} flex items-center gap-1 px-2 py-1 h-7`}
            >
              <StatusIcon className="w-4 h-4" />
              {project.status}
            </Badge>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span>{formatDate(project.startDate)}</span>
                {project.endDate && (
                  <>
                    <span>→</span>
                    <span>{formatDate(project.endDate)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2 items-center">
              {project.members.slice(0, 4).map((member, i) => (
                <Avatar key={i} className="border-2 border-background w-8 h-8 hover:translate-y-[-2px] transition-transform">
                  {member.user.image ? (
                    <AvatarImage src={member.user.image} alt={`${member.user.firstName} ${member.user.lastName}`} />
                  ) : (
                    <AvatarFallback className="text-xs">
                      {member.user.firstName[0]}
                      {member.user.lastName[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
              ))}
              {project.members.length > 4 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted hover:translate-y-[-2px] transition-transform">
                  <span className="text-xs font-medium">
                    +{project.members.length - 4}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              {endDate && daysRemaining !== null && (
                <div className={`text-sm ${daysRemaining < 0 ? 'text-destructive' : daysRemaining < 7 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {daysRemaining < 0 
                    ? `${Math.abs(daysRemaining)}d overdue`
                    : daysRemaining === 0
                    ? "Due today"
                    : `${daysRemaining}d remaining`
                  }
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{project._count.tasks}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}