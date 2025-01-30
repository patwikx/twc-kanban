import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { AuditAction, EntityType } from '@prisma/client';
import { headers } from 'next/headers';

export async function createAuditLog({
  entityId,
  entityType,
  action,
  changes,
  metadata,
}: {
  entityId: string;
  entityType: EntityType;
  action: AuditAction;
  changes?: any;
  metadata?: any;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error('User must be authenticated to create audit log');
  }

  const headersList = headers();
  const userAgent = headersList.get('user-agent');
  const ip = headersList.get('x-forwarded-for') || 'unknown';

  return prisma.auditLog.create({
    data: {
      entityId,
      entityType,
      action,
      userId: session.user.id,
      changes,
      metadata,
      ipAddress: ip,
      userAgent: userAgent || undefined,
    },
  });
}