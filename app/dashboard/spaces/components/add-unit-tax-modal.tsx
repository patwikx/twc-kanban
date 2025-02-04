'use client'

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { unitTaxSchema } from "@/schemas";
import { createUnitTax } from "@/lib/data/unit-tax";

interface AddTaxModalProps {
  unitId: string;
  onSuccess?: () => void;
}

export function AddTaxModal({ unitId, onSuccess }: AddTaxModalProps) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(unitTaxSchema),
    defaultValues: {
      taxYear: new Date().getFullYear(),
      taxDecNo: "",
      taxAmount: "",
      dueDate: "",
    },
  });

  async function onSubmit(data: any) {
    try {
      await createUnitTax({
        ...data,
        unitId,
      });
      toast.success("Tax record created successfully");
      setOpen(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create tax record");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Tax Record
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Tax Record</DialogTitle>
          <DialogDescription>
            Create a new real property tax record for this space
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="taxYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxDecNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Declaration Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Tax Record</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}