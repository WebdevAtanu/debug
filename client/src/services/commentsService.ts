import api from './api';

export interface Comment {
  id: number;
  author: {
    id: number;
    username: string;
    name: string;
    avatarUrl?: string;
  };
  content: string;
  created_at: string;
  updated_at: string;
  reactions?: { [key: string]: number[] };
  bug_id: number;
}

export const commentsService = {
  getComments: async (bugId: string) => {
    const response = await api.get(`/bugs/${bugId}/comments`);
    return response.data;
  },

  createComment: async (bugId: string, content: string) => {
    const response = await api.patch(`/bugs/${bugId}/comments`, { content });
    return response.data;
  },

  updateComment: async (bugId: string, commentId: string, content: string) => {
    const response = await api.patch(`/bugs/${bugId}/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (bugId: string, commentId: string) => {
    const response = await api.delete(`/bugs/${bugId}/comments/${commentId}`);
    return response.data;
  },

  getReactions: async (bugId: string, commentId: string) => {
    const response = await api.get(`/bugs/${bugId}/comments/${commentId}/reactions`);
    return response.data;
  },

  addOrRemoveReaction: async (bugId: string, commentId: string, emoji: string) => {
    const response = await api.patch(`/bugs/${bugId}/comments/${commentId}/reactions`, { emoji });
    return response.data;
  },
};
