'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SortAsc } from "lucide-react";

interface TenantSortProps {
  onSortChange?: (field: string, direction: "asc" | "desc") => void;
}

export function TenantSort({ onSortChange }: TenantSortProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SortAsc className="mr-2 h-4 w-4" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSortChange?.("name", "asc")}>
          Name (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange?.("name", "desc")}>
          Name (Z-A)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange?.("createdAt", "desc")}>
          Date Created (Newest)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange?.("createdAt", "asc")}>
          Date Created (Oldest)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange?.("status", "asc")}>
          Status (Active First)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange?.("status", "desc")}>
          Status (Inactive First)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}