import { notFound } from "next/navigation";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UnitDetailsView } from "../components/units-details-view";
import { getUnitDetails } from "@/lib/data/units-get";

interface UnitDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function UnitDetailsPage({ params }: UnitDetailsPageProps) {
  const unit = await getUnitDetails(params.id);

  if (!unit) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <UnitDetailsView unit={unit} />
      </Suspense>
    </div>
  );
}