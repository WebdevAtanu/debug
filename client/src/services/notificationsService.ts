import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  bug_id?: number;
  message: string;
  read: boolean;
  created_at: string;
}

export const notificationsService = {
  getNotifications: async (params?: { page?: number }) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  mentionPeople: async (bugId: string, mentions: string[]) => {
    const response = await api.post(`/notifications/mentions/${bugId}`, { mentions });
    return response.data;
  },
};
