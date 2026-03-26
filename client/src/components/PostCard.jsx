import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function PostCard({ post, currentUserId, onLike, onUnlike, onCommentAdded, onDeleted }) {
  const [comments, setComments] = useState([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUserId === post.user_id;
  const isLiked = !!post.is_liked_by_user;

  const fetchComments = useCallback(async (pageNum = 1) => {
    setLoadingComments(true);
    try {
      const { data } = await axiosInstance.get(`/posts/${post.id}/comments`, {
        params: { page: pageNum, limit: 10 },
      });
      const list = data.data || [];
      const meta = data.meta || {};
      if (pageNum === 1) {
        setComments(list);
        setCommentsTotal(meta.total || 0);
        setCommentsPage(1);
      } else {
        setComments((prev) => [...prev, ...list]);
        setCommentsPage(pageNum);
      }
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments && comments.length === 0 && commentsTotal === 0) {
      fetchComments(1);
    }
  }, [showComments, fetchComments, comments.length, commentsTotal]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`/posts/${post.id}/like`);
        onUnlike?.(post.id);
      } else {
        await axiosInstance.post(`/posts/${post.id}/like`);
        onLike?.(post.id);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await axiosInstance.post(`/posts/${post.id}/comments`, { content: newComment.trim() });
      setNewComment('');
      setCommentsTotal((t) => t + 1);
      fetchComments(1);
      onCommentAdded?.(post.id);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/posts/${post.id}`);
      onDeleted?.(post.id);
    } finally {
      setDeleting(false);
    }
  };

  let authorInitials = '?';
  try {
    if (post && post.author_name) {
      authorInitials = post.author_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    }
  } catch (e) {
    authorInitials = '?';
  }

  let createdAt = '';
  try {
    if (post && post.created_at) {
      const date = new Date(post.created_at);
      const now = new Date();
      const diffInSecs = Math.floor((now - date) / 1000);
      if (diffInSecs < 60) createdAt = 'Just now';
      else if (diffInSecs < 3600) createdAt = `${Math.floor(diffInSecs / 60)}m`;
      else if (diffInSecs < 86400) createdAt = `${Math.floor(diffInSecs / 3600)}h`;
      else createdAt = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  } catch (e) {
    createdAt = '';
  }

  return (
    <article className="card mb-2" style={{ padding: '12px 16px' }}>
      <div className="flex justify-between items-start mb-2">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-2 group">
          <span className="avatar avatar-md">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt="" />
            ) : (
              authorInitials
            )}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold group-hover:text-primary group-hover:underline">{post.author_name}</span>
            <span className="text-xs text-muted">
              {post.author_role === 'faculty' ? 'Faculty' : 'Student'}
              {post.author_department && ` • ${post.author_department}`}
            </span>
            <span className="text-xs text-muted flex items-center gap-1">
              {createdAt} • 🌐
            </span>
          </div>
        </Link>
        {isOwner && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '…' : '✕'}
          </button>
        )}
      </div>

      <div className="text-sm mb-4 whitespace-pre-wrap word-break-break-word">
        {post.content}
      </div>

      <div className="flex items-center justify-between text-xs text-muted mb-2 border-b border-border pb-2">
        <span className="flex items-center gap-1">
          {post.like_count > 0 && `👍 ${post.like_count}`}
        </span>
        <span>
          {post.comment_count > 0 && `${post.comment_count} comments`}
        </span>
      </div>

      <div className="flex gap-1 border-t border-border pt-1">
        <button
          type="button"
          className={`btn btn-ghost flex-1 gap-2 text-muted font-bold ${isLiked ? 'text-primary' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? '👍' : '👍'} Like
        </button>
        <button
          type="button"
          className="btn btn-ghost flex-1 gap-2 text-muted font-bold"
          onClick={() => setShowComments(!showComments)}
        >
          💬 Comment
        </button>
        <button type="button" className="btn btn-ghost flex-1 gap-2 text-muted font-bold">
          ↪️ Share
        </button>
        <button type="button" className="btn btn-ghost flex-1 gap-2 text-muted font-bold">
          ✈️ Send
        </button>
      </div>

      {showComments && (
        <div className="mt-4 animate-fade-in">
          <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
            <div className="avatar avatar-sm">Me</div>
            <input
              type="text"
              className="form-input rounded-full py-1 text-sm bg-bg-card-hover"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submittingComment}
            />
            {newComment.trim() && (
              <button type="submit" className="btn btn-primary btn-sm rounded-full" disabled={submittingComment}>
                Post
              </button>
            )}
          </form>

          {loadingComments && comments.length === 0 ? (
            <div className="spinner-wrapper py-4"><div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /></div>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="avatar avatar-sm">
                    {c.author_name[0]}
                  </div>
                  <div className="flex-1 bg-bg-card-hover p-2 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <Link to={`/profile/${c.user_id}`} className="font-semibold text-xs hover:text-primary hover:underline">{c.author_name}</Link>
                      <span className="text-[10px] text-muted">now</span>
                    </div>
                    <p className="text-xs">{c.content}</p>
                  </div>
                </div>
              ))}
              {commentsTotal > comments.length && (
                <button
                  type="button"
                  className="text-xs font-bold text-muted hover:text-primary mt-1 text-left"
                  onClick={() => fetchComments(commentsPage + 1)}
                  disabled={loadingComments}
                >
                  {loadingComments ? 'Loading…' : 'Load more comments'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
