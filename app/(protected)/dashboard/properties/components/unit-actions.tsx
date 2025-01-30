'use client';

import { Unit } from "@prisma/client";
import { EditUnitDialog } from "./edit-unit-dialog";
import { DeleteUnitDialog } from "./delete-unit-dialog";


interface UnitActionsProps {
  unit: Unit;
}

export function UnitActions({ unit }: UnitActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <EditUnitDialog unit={unit} />
      <DeleteUnitDialog unit={unit} />
    </div>
  );
}