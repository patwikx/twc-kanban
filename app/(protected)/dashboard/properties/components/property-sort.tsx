'use client'

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

export function PropertySort() {
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
        <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
        <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
        <DropdownMenuItem>Date Created (Newest)</DropdownMenuItem>
        <DropdownMenuItem>Date Created (Oldest)</DropdownMenuItem>
        <DropdownMenuItem>Total Units (High-Low)</DropdownMenuItem>
        <DropdownMenuItem>Total Units (Low-High)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}