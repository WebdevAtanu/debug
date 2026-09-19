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

  if (loading) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <span className="text-gray-500">Loading bug details...</span>
      </div>
    </div>
  );
  
  if (!bug) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center">
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body text-center py-12">
          <div className="text-6xl mb-4">🐛</div>
          <h3 className="text-xl font-semibold mb-2">Bug Not Found</h3>
          <p className="text-gray-500 mb-4">The bug you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Bugs
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost mb-6 gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Bugs
        </button>

        {error && (
          <div className="alert alert-error mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl mb-6 border border-base-200">
          <div className="card-body">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    #{bug.number} {bug.title}
                  </h1>
                  <div className={`badge ${bug.status === 'open' ? 'badge-success' : 'badge-error'} gap-1`}>
                    {bug.status === 'open' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {bug.status}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-8">
                        <span className="text-xs">{bug.author.username.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>
                    <span className="font-medium">{bug.author.username}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>{new Date(bug.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button
                onClick={handleToggleStatus}
                className={`btn ${bug.status === 'open' ? 'btn-error' : 'btn-success'} gap-2`}
              >
                {bug.status === 'open' ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close Bug
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Reopen Bug
                  </>
                )}
              </button>
            </div>

            <div className="prose max-w-none mb-6 bg-base-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-wrap">{bug.description}</p>
            </div>

            {bug.labels && bug.labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {bug.labels.map((label) => (
                  <span key={label} className="badge badge-outline badge-primary">
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border border-base-200">
          <div className="card-body">
            <h2 className="card-title text-xl mb-6 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comments ({comments.length})
            </h2>

            {user && (
              <div className="card bg-base-50 border border-base-200 mb-6">
                <div className="card-body">
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    {commentError && (
                      <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{commentError}</span>
                      </div>
                    )}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">Add a comment...</span>
                        <span className="label-text-alt text-gray-400">6-1000 characters</span>
                      </label>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts on this bug..."
                        className="textarea textarea-bordered focus:textarea-primary"
                        rows={4}
                        minLength={6}
                        maxLength={1000}
                      />
                      <label className="label">
                        <span className="label-text-alt">{commentText.length}/1000 characters</span>
                      </label>
                    </div>
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="btn btn-primary gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Post Comment
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="card bg-base-50 border border-base-200">
                    <div className="card-body py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10">
                              <span className="text-sm">{comment.author.username.charAt(0).toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{comment.author.username}</span>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugDetail;