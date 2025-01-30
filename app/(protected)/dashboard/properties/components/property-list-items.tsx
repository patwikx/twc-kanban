'use client';

import { Property } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PropertyListItemProps {
  property: Property;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  checked: boolean;
  collapsed?: boolean;
}

export function PropertyListItem({
  property,
  isSelected,
  onSelect,
  checked,
  collapsed = false,
}: PropertyListItemProps) {
  const router = useRouter();

  const handleClick = () => {
    router.replace(`/dashboard/properties?selected=${property.id}`);
  };

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
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium leading-none truncate">
                {property.propertyName}
              </p>
              <Badge 
                variant={property.propertyType === "RESIDENTIAL" ? "secondary" : "default"}
                className="flex-shrink-0"
              >
                {property.propertyType.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {property.propertyCode}
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
            <p className="font-medium">{property.propertyName}</p>
            <p className="text-sm text-muted-foreground">
              {property.propertyCode}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}