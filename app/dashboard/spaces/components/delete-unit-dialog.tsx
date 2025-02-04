
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { deleteUnit } from "@/lib/data/units-get";


interface DeleteUnitDialogProps {
  unitId: string;
  unitNumber: string;
}

export function DeleteUnitDialog({ unitId, unitNumber }: DeleteUnitDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    try {
      await deleteUnit(unitId);
      toast.success("Unit deleted successfully");
      router.push("/dashboard/spaces");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete unit");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          Delete Space
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Space</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete space {unitNumber}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}