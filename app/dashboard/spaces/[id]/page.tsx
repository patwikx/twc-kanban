import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { UnitDetailsView } from "../components/units-details-view";
import { getUnitDetails } from "@/lib/data/units-get";
import { getUsers } from "@/actions/get-users-property-tax";
import { auth } from "@/auth";

interface UnitDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function UnitDetailsPage({ params }: UnitDetailsPageProps) {
  // Handle all server-side data fetching here
  const [unit, users, session] = await Promise.all([
    getUnitDetails(params.id),
    getUsers(),
    auth()
  ]);

  if (!unit) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <UnitDetailsView 
          unit={unit}
          users={users}
          currentUserId={session?.user?.id}
        />
      </Suspense>
    </div>
  );
}