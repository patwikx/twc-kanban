'use client';

import { Tenant } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface TenantListItemProps {
  tenant?: Tenant;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
  checked?: boolean;
  collapsed?: boolean;
  isLoading?: boolean;
}

export function TenantListItem({
  tenant,
  isSelected,
  onSelect,
  checked,
  collapsed = false,
  isLoading = false,
}: TenantListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    if (isLoading || !tenant) return;
    router.replace(`/dashboard/tenants?selected=${tenant.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 border-b">
        <div className="flex items-center space-x-4">
          {!collapsed && <Skeleton className="h-4 w-4" />}
          <div className={cn(
            "flex items-center space-x-4 min-w-0",
            collapsed ? "justify-center" : "flex-1"
          )}>
            <Skeleton className="h-10 w-10 rounded-full" />
            {!collapsed && (
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) return null;

  const content = (
    <div
      className={cn(
        "flex items-center space-x-4 p-4 cursor-pointer transition-colors duration-200",
        "hover:bg-secondary/50",
        isSelected && "bg-secondary/50"
      )}
      onClick={handleClick}
    >
      {!collapsed && (
        <Checkbox
          checked={checked}
          onCheckedChange={onSelect}
          onClick={(e) => e.stopPropagation()}
          className="translate-y-[1px]"
        />
      )}
      <div className={cn(
        "flex items-center space-x-4 min-w-0",
        collapsed ? "justify-center" : "flex-1"
      )}>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
          <Users className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium leading-none truncate">
                {tenant.firstName} {tenant.lastName}
              </p>
              <Badge 
                variant={tenant.status === "ACTIVE" ? "default" : "secondary"}
                className="flex-shrink-0"
              >
                {tenant.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {tenant.bpCode} • {tenant.company}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[300px]">
          <div className="space-y-1">
            <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
            <p className="text-sm text-muted-foreground">
              {tenant.bpCode} • {tenant.company}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}