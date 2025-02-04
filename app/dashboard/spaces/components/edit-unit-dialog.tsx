'use client'

import { useState } from "react";
import { Unit } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { updateUnitDialog } from "@/actions/units";

interface EditUnitDialogProps {
  unit: Unit;
}

export function EditUnitDialog({ unit }: EditUnitDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  async function onSubmit(formData: FormData) {
    try {
      setIsLoading(true);
      await updateUnitDialog(unit.id, formData);
      toast.success("Unit updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update unit");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Edit Space
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Space {unit.unitNumber}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unitArea">Unit Area (sqm)</Label>
            <Input
              id="unitArea"
              name="unitArea"
              type="number"
              step="0.01"
              defaultValue={unit.unitArea.toString()}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unitRate">Rate per sqm</Label>
            <Input
              id="unitRate"
              name="unitRate"
              type="number"
              step="0.01"
              defaultValue={unit.unitRate.toString()}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rentAmount">Rent Amount</Label>
            <Input
              id="rentAmount"
              name="rentAmount"
              type="number"
              step="0.01"
              defaultValue={unit.rentAmount.toString()}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFirstFloor"
                name="isFirstFloor"
                defaultChecked={unit.isFirstFloor}
              />
              <Label htmlFor="isFirstFloor">First Floor</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSecondFloor"
                name="isSecondFloor"
                defaultChecked={unit.isSecondFloor}
              />
              <Label htmlFor="isSecondFloor">Second Floor</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isThirdFloor"
                name="isThirdFloor"
                defaultChecked={unit.isThirdFloor}
              />
              <Label htmlFor="isThirdFloor">Third Floor</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRoofTop"
                name="isRoofTop"
                defaultChecked={unit.isRoofTop}
              />
              <Label htmlFor="isRoofTop">Roof Top</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isMezzanine"
                name="isMezzanine"
                defaultChecked={unit.isMezzanine}
              />
              <Label htmlFor="isMezzanine">Mezzanine</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}