import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        leases: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
            tenant: true,
            payments: true,
          },
        },
        maintenanceRequests: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
        },
        documents: true,
      },
    });

    return NextResponse.json(tenant);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 