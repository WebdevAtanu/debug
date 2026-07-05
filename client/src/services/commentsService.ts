import api from './api';

export interface Comment {
  _id: string;
  author: {
    _id: string;
    username: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
  reactions?: { [key: string]: string[] };
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

  addOrRemoveReaction: async (bugId: string, commentId: string, reaction: string) => {
    const response = await api.patch(`/bugs/${bugId}/comments/${commentId}/reactions`, { reaction });
    return response.data;
  },
};
