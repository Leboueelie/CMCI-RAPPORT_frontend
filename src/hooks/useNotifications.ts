"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export interface Notification {
  id: string;
  titre: string;
  message: string;
  lien?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export function useNotifications(unreadOnly?: boolean) {
  const { user } = useAuth();

  return useQuery<NotificationsResponse>({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (unreadOnly) params.append("unreadOnly", "true");
      const { data } = await api.get(`/notifications?${params.toString()}`);
      return data;
    },
    enabled: !!user,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/notifications/${id}/lire`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/notifications/lire-tout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
