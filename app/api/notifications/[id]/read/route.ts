import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.notification.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return new NextResponse('OK');
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 