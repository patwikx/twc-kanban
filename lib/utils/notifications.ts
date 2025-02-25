'use server'

import { prisma } from '@/lib/db';
import { NotificationType, NotificationPriority, EntityType } from '@prisma/client';
import { AppError } from './error';
import { auth } from '@/auth';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  entityId?: string;
  entityType?: EntityType;
  expiresAt?: Date;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  priority = 'MEDIUM',
  actionUrl,
  entityId,
  entityType,
  expiresAt,
}: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        priority,
        actionUrl,
        entityId,
        entityType,
        expiresAt,
      },
    });
  } catch (error) {
    throw new AppError(
      'Failed to create notification',
      500,
      'NOTIFICATION_CREATE_ERROR'
    );
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    return await prisma.notification.update({
      where: { 
        id: notificationId,
        userId: session.user.id, // Ensure user can only mark their own notifications
      },
      data: { 
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    throw new AppError(
      'Failed to mark notification as read',
      500,
      'NOTIFICATION_UPDATE_ERROR'
    );
  }
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    return await prisma.notification.delete({
      where: { 
        id: notificationId,
        userId: session.user.id, // Ensure user can only delete their own notifications
      },
    });
  } catch (error) {
    throw new AppError(
      'Failed to delete notification',
      500,
      'NOTIFICATION_DELETE_ERROR'
    );
  }
}

export async function getUnreadNotificationsCount(userId: string) {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  } catch (error) {
    throw new AppError(
      'Failed to get unread notifications count',
      500,
      'NOTIFICATION_COUNT_ERROR'
    );
  }
}

export async function getUserNotifications(
  options: {
    limit?: number;
    includeRead?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
  } = {}
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  const { 
    limit = 50, 
    includeRead = true,
    type,
    priority 
  } = options;

  try {
    return await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(includeRead ? {} : { isRead: false }),
        ...(type ? { type } : {}),
        ...(priority ? { priority } : {}),
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
      take: limit,
    });
  } catch (error) {
    throw new AppError(
      'Failed to get notifications',
      500,
      'NOTIFICATION_FETCH_ERROR'
    );
  }
}

export async function markAllNotificationsAsRead() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    return await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    throw new AppError(
      'Failed to mark all notifications as read',
      500,
      'NOTIFICATION_BULK_UPDATE_ERROR'
    );
  }
}

export async function deleteAllNotifications() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    return await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
      },
    });
  } catch (error) {
    throw new AppError(
      'Failed to delete all notifications',
      500,
      'NOTIFICATION_BULK_DELETE_ERROR'
    );
  }
}