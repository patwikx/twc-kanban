import useSWR from 'swr';

export function NotificationDrawer() {
  const { data: notifications, mutate } = useSWR('/api/notifications', {
    refreshInterval: 1000, // Poll every 3 seconds
  });

  // Rest of your component code...
} 