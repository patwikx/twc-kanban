'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
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
import { Plus } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { createPropertyTax } from "@/actions/property-tax";

const propertyTaxFormSchema = z.object({
  taxYear: z.number().min(2000, "Valid tax year is required"),
  taxDecNo: z.string().min(1, "Tax declaration number is required"),
  taxAmount: z.number().positive("Tax amount must be positive"),
  dueDate: z.string().min(1, "Due date is required"),
});

type PropertyTaxFormValues = z.infer<typeof propertyTaxFormSchema>;

interface AddPropertyTaxDialogProps {
  propertyId: string;
}

export function AddPropertyTaxDialog({ propertyId }: AddPropertyTaxDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<PropertyTaxFormValues>({
    resolver: zodResolver(propertyTaxFormSchema),
    defaultValues: {
      taxYear: new Date().getFullYear(),
    },
  });

  const { execute: submitForm, loading: isSubmitting } = useAsync(
    async (data: PropertyTaxFormValues) => {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      await createPropertyTax(formData);
      setOpen(false);
      form.reset();
    },
    {
      successMessage: "Property tax record has been added successfully.",
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Property Tax
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Property Tax Record</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taxYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="2000" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
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
                    <FormLabel>Tax Declaration No.</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="taxAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Amount (₱)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
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
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Tax Record"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}