import type { Notifications } from "@repo/db";
import type { NotificationType } from "@repo/schema";
import axios from "@/lib/axios";
import type { ApiResponse } from "@/types/api";

export type NotificationWithPagination = {
  data: Notifications[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type ListNotificationsParams = {
  user_id: string;
  is_read?: boolean;
  type?: NotificationType;
  limit?: number;
  offset?: number;
};

export const notificationApi = {
  /**
   * Get list of notifications with pagination
   */
  getAll: async (params: ListNotificationsParams) => {
    const searchParams = new URLSearchParams();
    searchParams.set("user_id", params.user_id);
    if (params.is_read !== undefined)
      searchParams.set("is_read", String(params.is_read));
    if (params.type) searchParams.set("type", params.type);
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.offset) searchParams.set("offset", String(params.offset));

    const res = await axios.get<ApiResponse<NotificationWithPagination>>(
      `/notifications?${searchParams.toString()}`,
    );
    const { data } = res.data;
    return data;
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async (userId: string) => {
    const res = await axios.get<ApiResponse<{ count: number }>>(
      `/notifications/unread-count?user_id=${userId}`,
    );
    const { data } = res.data;
    return data.count;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string) => {
    const res = await axios.patch<ApiResponse<Notifications>>(
      `/notifications/${id}/read`,
    );
    const { data } = res.data;
    return data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (userId: string) => {
    const res = await axios.patch<ApiResponse<{ count: number }>>(
      `/notifications/read-all?user_id=${userId}`,
    );
    const { data } = res.data;
    return data;
  },

  /**
   * Delete a notification
   */
  delete: async (id: string) => {
    const res = await axios.delete<ApiResponse<Notifications>>(
      `/notifications/${id}`,
    );
    const { data } = res.data;
    return data;
  },

  /**
   * Delete all read notifications
   */
  deleteRead: async (userId: string) => {
    const res = await axios.delete<ApiResponse<{ count: number }>>(
      `/notifications/read?user_id=${userId}`,
    );
    const { data } = res.data;
    return data;
  },
};
