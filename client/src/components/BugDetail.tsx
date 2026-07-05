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
  const [commentText, setCommentText] = useState('');
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
      const response = await bugsService.getBugByNumber(bugId!);
      setBug(response.data?.bug || response.data);
    } catch (error) {
      console.error('Failed to fetch bug:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentsService.getComments(bugId!);
      setComments(response.data?.comments || response.data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      await commentsService.createComment(bugId!, commentText);
      setCommentText('');
      fetchComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!bug) return;
    try {
      if (bug.status === 'open') {
        await bugsService.closeBug(bugId!);
      } else {
        await bugsService.openBug(bugId!);
      }
      fetchBug();
    } catch (error) {
      console.error('Failed to toggle bug status:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!bug) return <div className="error">Bug not found</div>;

  return (
    <div className="bug-detail">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to Bugs
      </button>
      <div className="bug-header">
        <h1>#{bug.number} {bug.title}</h1>
        <div className="bug-meta">
          <span className={`status ${bug.status}`}>{bug.status}</span>
          <span className="author">by {bug.author.username}</span>
          <span className="date">
            {new Date(bug.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="bug-description">
        <p>{bug.description}</p>
      </div>
      {bug.labels && bug.labels.length > 0 && (
        <div className="labels">
          {bug.labels.map((label) => (
            <span key={label} className="label">
              {label}
            </span>
          ))}
        </div>
      )}
      <div className="bug-actions">
        <button
          className={`toggle-btn ${bug.status}`}
          onClick={handleToggleStatus}
        >
          {bug.status === 'open' ? 'Close Bug' : 'Reopen Bug'}
        </button>
      </div>
      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        {user && (
          <form className="comment-form" onSubmit={handleCommentSubmit}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={4}
            />
            <button type="submit" disabled={!commentText.trim()}>
              Post Comment
            </button>
          </form>
        )}
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.author.username}</span>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="comment-content">{comment.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BugDetail;
