'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UnitStatus } from "@prisma/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAsync } from "@/hooks/use-async";
import { unitSchema } from "@/lib/utils/validation";
import { createUnit } from "@/actions/units";
import { Checkbox } from "@/components/ui/checkbox";
import z from "zod";
import { toast } from "sonner";

const extendedUnitSchema = unitSchema.extend({
  isFirstFloor: z.boolean().default(false),
  isSecondFloor: z.boolean().default(false),
  isThirdFloor: z.boolean().default(false),
  isRoofTop: z.boolean().default(false),
  isMezzanine: z.boolean().default(false),
});

type UnitFormValues = z.infer<typeof extendedUnitSchema>;

interface AddUnitDialogProps {
  propertyId: string;
}

const floorOptions = [
  { id: "isFirstFloor", label: "Ground Floor" },
  { id: "isSecondFloor", label: "Second Floor" },
  { id: "isThirdFloor", label: "Third Floor" },
  { id: "isRoofTop", label: "Roof Top" },
  { id: "isMezzanine", label: "Mezzanine" },
] as const;

export function AddUnitDialog({ propertyId }: AddUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(extendedUnitSchema),
    defaultValues: {
      status: UnitStatus.VACANT,
      isFirstFloor: false,
      isSecondFloor: false,
      isThirdFloor: false,
      isRoofTop: false,
      isMezzanine: false,
    },
  });

  const handleFloorChange = (fieldName: string, checked: boolean) => {
    if (!checked) {
      form.setValue(fieldName as keyof UnitFormValues, false);
      return;
    }

    floorOptions.forEach(option => {
      form.setValue(option.id as keyof UnitFormValues, option.id === fieldName);
    });
  };

  const { execute: submitForm, loading: isSubmitting } = useAsync(
    async (data: UnitFormValues) => {
      try {
        const formData = new FormData();
        formData.append("propertyId", propertyId);
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        await createUnit(formData);
        setOpen(false);
        form.reset();
        toast.success("Space has been created successfully");
      } catch (error) {
        toast.error("Failed to create space. Please try again.");
      }
    }
  );

  const calculateRentAmount = (area: number, rate: number) => {
    const rentAmount = area * rate;
    form.setValue("rentAmount", rentAmount);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Space</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submitForm)} className="space-y-4">
            <FormField
              control={form.control}
              name="unitNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter unit number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="unitArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (sqm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field}
                        onChange={(e) => {
                          const area = parseFloat(e.target.value);
                          field.onChange(area);
                          const rate = form.getValues("unitRate");
                          if (rate) calculateRentAmount(area, rate);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₱/sqm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field}
                        onChange={(e) => {
                          const rate = parseFloat(e.target.value);
                          field.onChange(rate);
                          const area = form.getValues("unitArea");
                          if (area) calculateRentAmount(area, rate);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="rentAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (₱)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Floor Location</h3>
              <div className="grid grid-cols-2 gap-4">
                {floorOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name={option.id as keyof UnitFormValues}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value as boolean}
                            onCheckedChange={(checked) => {
                              handleFloorChange(option.id, !!checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{option.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UnitStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {isSubmitting ? "Creating..." : "Create Unit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}