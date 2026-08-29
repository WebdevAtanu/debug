import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bugsService } from '../services/bugsService';
import { commentsService } from '../services/commentsService';
import type { Comment } from '../services/commentsService';
import { useAuth } from '../contexts/AuthContext';
import type { Bug } from '../services/bugsService';

const BugDetail: React.FC = () => {
  const { bugId } = useParams<{ bugId: string }>();
  const [bug, setBug] = useState<Bug | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (bugId) {
      fetchBug();
      fetchComments();
    }
  }, [bugId]);

  const fetchBug = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await bugsService.getBugByNumber(bugId!);
      setBug(response.data);
    } catch (err: any) {
      setError(err.userMessage || 'Failed to fetch bug');
      console.error('Failed to fetch bug:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsService.getComments(bugId!);
      setComments(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch comments:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    // Client-side validation
    if (commentText.trim().length < 6) {
      setCommentError('Comment must be at least 6 characters');
      return;
    }

    try {
      setCommentError('');
      await commentsService.createComment(bugId!, commentText);
      setCommentText('');
      fetchComments();
    } catch (err: any) {
      setCommentError(err.userMessage || 'Failed to create comment');
      console.error('Failed to create comment:', err);
    }
  };

  const handleToggleStatus = async () => {
    if (!bug) return;
    try {
      setError('');
      if (bug.status === 'open') {
        await bugsService.closeBug(bugId!);
      } else {
        await bugsService.openBug(bugId!);
      }
      fetchBug();
    } catch (err: any) {
      setError(err.userMessage || 'Failed to toggle bug status');
      console.error('Failed to toggle bug status:', err);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!bug) return <div className="text-center py-12 bg-white rounded-lg shadow"><p className="text-gray-500">Bug not found</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
        >
          ← Back to Bugs
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              #{bug.number} {bug.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                bug.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {bug.status}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <span>by {bug.author.username}</span>
            <span>•</span>
            <span>{new Date(bug.created_at).toLocaleDateString()}</span>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{bug.description}</p>
          </div>

          {bug.labels && bug.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {bug.labels.map((label) => (
                <span
                  key={label}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={handleToggleStatus}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              bug.status === 'open'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {bug.status === 'open' ? 'Close Bug' : 'Reopen Bug'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              {commentError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {commentError}
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={4}
                minLength={6}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              />
              <div className="text-sm text-gray-500 mt-1">
                {commentText.length}/1000 characters (min 6)
              </div>
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Post Comment
              </button>
            </form>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.author.username}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetail;
