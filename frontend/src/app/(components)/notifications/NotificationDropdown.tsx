'use client';

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { BellRing, Check } from 'lucide-react';
import Link from 'next/link';
import {
  useNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from '@/services/api/notification';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_QUERY_KEYS } from '@/services/apiBaseUrl';

const NotificationDropdown = () => {
  const queryClient = useQueryClient();
  const { data: notificationsData, isLoading } = useNotifications();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const notifications = notificationsData?.slice(0, 5) || [];
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative group">
          <BellRing className="text-gold group-hover:text-gold transition-colors" size={28} />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold rounded-full w-3 h-3 shadow-lg animate-pulse" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 p-2 bg-black/95 border border-gold-500/30 text-white shadow-xl rounded-2xl backdrop-blur-sm"
        align="end"
      >
        {isLoading && <p className="text-center text-sm text-gray-400">Loading...</p>}
        {!isLoading && notifications.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-2">No notifications</p>
        )}

        {notifications.map((notif: Notification) => (
          <DropdownMenuItem
            key={notif.id}
            className={`flex justify-between items-center px-3 py-2 rounded-xl transition-all ${
              hoveredId === notif.id ? 'bg-gold text-gold' : 'hover:bg-gold'
            }`}
            onMouseEnter={() => setHoveredId(notif.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex flex-col truncate">
              <span className="truncate text-sm font-medium">{notif.message}</span>
              <span className="text-xs text-gray-500">
                {new Date(notif.createdAt).toLocaleString()}
              </span>
            </div>

            {hoveredId === notif.id && (
              <button
                onClick={() => markReadMutation.mutate(notif.id)}
                className="ml-3 text-gold hover:text-gold transition"
              >
                <Check size={18} />
              </button>
            )}
          </DropdownMenuItem>
        ))}

        {notifications.length > 0 && (
          <div className="flex justify-between mt-3 border-t border-gold-500/20 pt-2 px-2 text-sm">
            <Link href="/notifications" className="text-gold hover:text-gold transition">
              View All
            </Link>
            <button
              onClick={() => markAllMutation.mutate()}
              className="text-gold hover:text-gold transition"
            >
              Mark All as Read
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
