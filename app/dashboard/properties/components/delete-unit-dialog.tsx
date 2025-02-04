'use client';

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { Unit } from "@prisma/client";
import { deleteUnit } from "@/actions/units";

interface DeleteUnitDialogProps {
  unit: Unit;
}

export function DeleteUnitDialog({ unit }: DeleteUnitDialogProps) {
  const [open, setOpen] = useState(false);

  const { execute: handleDelete, loading: isDeleting } = useAsync(
    async () => {
      await deleteUnit(unit.id);
      setOpen(false);
    },
    {
      successMessage: "Unit has been deleted successfully.",
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Unit</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete unit {unit.unitNumber}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleDelete()}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Unit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}