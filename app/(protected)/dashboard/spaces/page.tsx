
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UnitStats } from "./components/units-stats";
import { UnitsTableSkeleton } from "./components/units-loading";
import { UnitsDataTable } from "./components/units-table";
import Link from "next/link";


export default function UnitsPage() {


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Units Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your property units in one place
          </p>
        </div>
        <Button asChild>
            <Link href="/dashboard/spaces/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Link>
          </Button>
      </div>

      <Suspense fallback={<div className="space-y-4">Loading statistics...</div>}>
        <UnitStats />
      </Suspense>

      <Suspense fallback={<UnitsTableSkeleton />}>
        <UnitsDataTable />
      </Suspense>
    </div>
  );
}