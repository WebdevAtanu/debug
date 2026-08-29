import api from './api';

export interface Bug {
  id: number;
  number: number;
  title: string;
  description: string;
  status: 'open' | 'closed';
  labels: string[];
  reactions: { [key: string]: number[] };
  author: {
    id: number;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  created_at: string;
  updated_at: string;
}

export const bugsService = {
  getBugs: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/bugs', { params });
    return response.data;
  },

  getBugByNumber: async (bugId: string) => {
    const response = await api.get(`/bugs/${bugId}`);
    return response.data;
  },

  createBug: async (bugData: { title: string; description: string; labels?: string[] }) => {
    const response = await api.post('/bugs', bugData);
    return response.data;
  },

  updateBug: async (bugId: string, bugData: { title?: string; description?: string }) => {
    const response = await api.patch(`/bugs/${bugId}`, bugData);
    return response.data;
  },

  closeBug: async (bugId: string) => {
    const response = await api.patch(`/bugs/${bugId}/close`);
    return response.data;
  },

  openBug: async (bugId: string) => {
    const response = await api.patch(`/bugs/${bugId}/open`);
    return response.data;
  },

  updateLabels: async (bugId: string, labels: string[]) => {
    const response = await api.patch(`/bugs/${bugId}/labels`, { labels });
    return response.data;
  },

  deleteLabel: async (bugId: string, labelName: string) => {
    const response = await api.delete(`/bugs/${bugId}/labels/${labelName}`);
    return response.data;
  },

  addReferences: async (bugId: string, references: string[]) => {
    const response = await api.patch(`/bugs/${bugId}/references`, { references });
    return response.data;
  },

  getReactions: async (bugId: string) => {
    const response = await api.get(`/bugs/${bugId}/reactions`);
    return response.data;
  },

  addOrRemoveReaction: async (bugId: string, emoji: string) => {
    const response = await api.patch(`/bugs/${bugId}/reactions`, { emoji });
    return response.data;
  },

  getTimeline: async (bugId: string) => {
    const response = await api.get(`/bugs/${bugId}/timeline`);
    return response.data;
  },

  getSuggestions: async () => {
    const response = await api.get('/bugs/suggestions');
    return response.data;
  },
};
