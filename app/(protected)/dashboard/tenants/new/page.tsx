'use client';

import { TenantForm } from "../components/tenants-form";


export default function NewTenantPage() {
  return (
    <div className="h-full flex-1 flex flex-col space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Tenant</h2>
          <p className="text-muted-foreground">
            Create a new tenant profile or import multiple tenants via CSV
          </p>
        </div>
      </div>
      <TenantForm />
    </div>
  );
}