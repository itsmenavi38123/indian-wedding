'use client';

import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  useNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from '@/services/api/notification';
import { API_QUERY_KEYS } from '@/services/apiBaseUrl';
import { Check } from 'lucide-react';

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useNotifications();
  const notificationsQueryKey = [API_QUERY_KEYS.notifications?.getAll || 'notifications'];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: (_, id: string) => {
      queryClient.setQueryData<Notification[] | undefined>(notificationsQueryKey, (old) =>
        old?.filter((notif) => notif.id !== id)
      );
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.setQueryData<Notification[] | undefined>(notificationsQueryKey, []);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-gold text-lg">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-black text-white">
      <div className="flex justify-between items-center mb-6 border-b border-gold/30 pb-3">
        <h1 className="text-2xl font-bold text-gold">Notifications</h1>
        {notifications && notifications.length > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="px-3 py-1 border border-gold rounded-xl text-gold text-sm hover:bg-gold hover:text-black transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {!notifications || notifications.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notif: Notification) => (
            <li
              key={notif.id}
              className="flex justify-between items-start bg-black/60 border border-gold/20 hover:border-gold/60 rounded-xl p-4 transition-all"
            >
              <div className="flex flex-col">
                <span className="text-sm text-white">{notif.message}</span>
                <span className="text-xs text-gray-500 mt-1">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => markReadMutation.mutate(notif.id)}
                className="text-gold hover:text-white transition ml-4"
                title="Mark as read"
              >
                <Check size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
