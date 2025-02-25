import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: [
        { isRead: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50,
    });


    return NextResponse.json(notifications);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    return new NextResponse('OK');
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
} 