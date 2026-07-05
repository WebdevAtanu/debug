import api from './api';

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  message: string;
  bugId?: string;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  mentionPeople: async (bugId: string, usernames: string[]) => {
    const response = await api.post(`/notifications/mentions/${bugId}`, { usernames });
    return response.data;
  },
};
