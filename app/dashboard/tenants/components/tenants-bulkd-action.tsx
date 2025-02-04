'use client';

import { bulkDeleteTenants } from "@/actions/tenants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


interface TenantBulkActionsProps {
  selectedIds?: string[];
}

export function TenantBulkActions({ selectedIds = [] }: TenantBulkActionsProps) {
  const hasSelection = selectedIds.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasSelection}>
          <MoreHorizontal className="mr-2 h-4 w-4" />
          Bulk Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            if (confirm("Are you sure you want to delete the selected tenants?")) {
              bulkDeleteTenants(selectedIds);
            }
          }}
          className="text-destructive"
        >
          Delete Selected
        </DropdownMenuItem>
        <DropdownMenuItem>Export Selected</DropdownMenuItem>
        <DropdownMenuItem>Archive Selected</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}