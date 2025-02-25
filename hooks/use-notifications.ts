'use client';

import { useState, useEffect } from 'react';
import { Notification } from '@prisma/client';
import { toast } from 'sonner';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error("Failed to mark notification as read");
    }
  };

  const clearAll = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to clear notifications');
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      toast.error("Failed to clear notifications");
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    clearAll,
    refresh: fetchNotifications
  };
}