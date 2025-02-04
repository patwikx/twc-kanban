'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { LeaseWithRelations } from "@/types";
import { terminateLease } from "@/actions/lease";

const terminateLeaseSchema = z.object({
  terminationDate: z.string().min(1, "Termination date is required"),
  reason: z.string().min(1, "Termination reason is required"),
});

type TerminateLeaseFormValues = z.infer<typeof terminateLeaseSchema>;

interface TerminateLeaseDialogProps {
  lease: LeaseWithRelations;
}

export function TerminateLeaseDialog({ lease }: TerminateLeaseDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<TerminateLeaseFormValues>({
    resolver: zodResolver(terminateLeaseSchema),
  });

  const { execute: submitForm, loading: isSubmitting } = useAsync(
    async (data: TerminateLeaseFormValues) => {
      const formData = new FormData();
      formData.append("terminationDate", data.terminationDate);
      formData.append("reason", data.reason);

      await terminateLease(lease.id, formData);
      setOpen(false);
    },
    {
      successMessage: "Lease has been terminated successfully.",
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          <Ban className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Terminate Lease</DialogTitle>
          <DialogDescription>
            Are you sure you want to terminate this lease? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
            <FormField
              control={form.control}
              name="terminationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Termination Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Termination</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter reason for termination" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Terminating..." : "Terminate Lease"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}