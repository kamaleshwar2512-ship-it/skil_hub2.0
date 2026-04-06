import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function PostCard({ post, currentUserId, onLike, onUnlike, onCommentAdded, onDeleted }) {
  const [comments,          setComments]          = useState([]);
  const [commentsPage,      setCommentsPage]       = useState(1);
  const [commentsTotal,     setCommentsTotal]      = useState(0);
  const [showComments,      setShowComments]       = useState(false);
  const [loadingComments,   setLoadingComments]    = useState(false);
  const [newComment,        setNewComment]         = useState('');
  const [submittingComment, setSubmittingComment]  = useState(false);
  const [deleting,          setDeleting]           = useState(false);

  // ── Guard: if post is null/undefined, render nothing ──────────
  if (!post || typeof post !== 'object') return null;

  const postId    = post.id;
  const isOwner   = currentUserId != null && currentUserId === post.user_id;
  const isLiked   = !!post.is_liked_by_user;
  const authorName= post.author_name ?? 'Unknown User';

  // ── Author initials ────────────────────────────────────────────
  const authorInitials = authorName
    .split(' ')
    .map((n) => n?.[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  // ── Relative time ──────────────────────────────────────────────
  let createdAt = '';
  try {
    if (post.created_at) {
      const date          = new Date(post.created_at);
      const diffInSecs    = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffInSecs < 60)    createdAt = 'Just now';
      else if (diffInSecs < 3600)  createdAt = `${Math.floor(diffInSecs / 60)}m ago`;
      else if (diffInSecs < 86400) createdAt = `${Math.floor(diffInSecs / 3600)}h ago`;
      else createdAt = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  } catch { createdAt = ''; }

  // ── Post type colour chip ──────────────────────────────────────
  const POST_TYPE_STYLE = {
    achievement:    'cat-hackathon',
    project_update: 'badge-primary',
    research:       'cat-research',
    general:        'badge-muted',
  };
  const postTypeLabel = post.post_type
    ? { achievement: '🏆 Achievement', project_update: '📢 Update', research: '🔬 Research', general: '✏️ Post' }[post.post_type] ?? post.post_type
    : null;

  // ── Fetch comments ────────────────────────────────────────────
  const fetchComments = useCallback(async (pageNum = 1) => {
    if (!postId) return;
    setLoadingComments(true);
    try {
      const { data } = await axiosInstance.get(`/posts/${postId}/comments`, {
        params: { page: pageNum, limit: 10 },
      });
      const list = data?.data ?? [];
      const meta = data?.meta ?? {};
      if (pageNum === 1) {
        setComments(list);
        setCommentsTotal(meta.total ?? 0);
        setCommentsPage(1);
      } else {
        setComments((prev) => [...prev, ...list]);
        setCommentsPage(pageNum);
      }
    } catch {
      // silently fail — comments not critical
    } finally {
      setLoadingComments(false);
    }
  }, [postId]);

  useEffect(() => {
    if (showComments && comments.length === 0 && commentsTotal === 0) {
      fetchComments(1);
    }
  }, [showComments, fetchComments, comments.length, commentsTotal]);

  // ── Like / Unlike ─────────────────────────────────────────────
  const handleLike = async () => {
    try {
      if (isLiked) {
        await axiosInstance.delete(`/posts/${postId}/like`);
        onUnlike?.(postId);
      } else {
        await axiosInstance.post(`/posts/${postId}/like`);
        onLike?.(postId);
      }
    } catch { /* ignore */ }
  };

  // ── Submit comment ────────────────────────────────────────────
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await axiosInstance.post(`/posts/${postId}/comments`, { content: newComment.trim() });
      setNewComment('');
      setCommentsTotal((t) => t + 1);
      fetchComments(1);
      onCommentAdded?.(postId);
    } catch { /* ignore */ } finally {
      setSubmittingComment(false);
    }
  };

  // ── Delete post ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      onDeleted?.(postId);
    } catch { /* ignore */ } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="card" style={{ padding: '14px 16px', borderRadius: 'var(--radius-xl)' }}>

      {/* ── Header ── */}
      <div className="flex justify-between items-start" style={{ marginBottom: 10 }}>
        <Link to={`/profile/${post.user_id ?? ''}`} className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <span className="avatar avatar-md" style={{ flexShrink: 0 }}>
            {post.author_avatar
              ? <img src={post.author_avatar} alt={authorName} />
              : authorInitials}
          </span>
          <div className="flex flex-col" style={{ gap: 1 }}>
            <span className="post-card-author-name">{authorName}</span>
            <span className="post-card-author-meta">
              {post.author_role === 'faculty' ? 'Faculty' : 'Student'}
              {post.author_department ? ` · ${post.author_department}` : ''}
            </span>
            {createdAt && (
              <span className="post-card-author-meta">{createdAt} · 🌐</span>
            )}
          </div>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {postTypeLabel && (
            <span className={`badge ${POST_TYPE_STYLE[post.post_type] ?? 'badge-muted'}`}>
              {postTypeLabel}
            </span>
          )}
          {isOwner && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleDelete}
              disabled={deleting}
              title="Delete post"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {deleting ? '…' : '✕'}
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="post-card-content" style={{ marginBottom: 12 }}>
        {post.content ?? ''}
      </div>

      {/* ── Reaction summary ── */}
      {((post.like_count ?? 0) > 0 || (post.comment_count ?? 0) > 0) && (
        <div
          className="flex items-center justify-between text-xs text-muted"
          style={{ paddingBottom: 8, marginBottom: 4, borderBottom: '1px solid var(--color-border)' }}
        >
          <span>{(post.like_count ?? 0) > 0 ? `👍 ${post.like_count}` : ''}</span>
          <span>{(post.comment_count ?? 0) > 0 ? `${post.comment_count} comments` : ''}</span>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="post-card-actions">
        <button
          type="button"
          className={`post-action-btn${isLiked ? ' liked' : ''}`}
          onClick={handleLike}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isLiked ? '❤️' : '🤍'} Like
        </button>
        <button
          type="button"
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          💬 Comment
        </button>
        <button
          type="button"
          className="post-action-btn"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          ↪️ Share
        </button>
      </div>

      {/* ── Comments Panel ── */}
      {showComments && (
        <div className="animate-fade-in" style={{ marginTop: 12 }}>
          {/* Comment input */}
          <form onSubmit={handleSubmitComment} className="flex gap-2" style={{ marginBottom: 12 }}>
            <span
              className="avatar avatar-sm"
              style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', flexShrink: 0 }}
            >
              You
            </span>
            <input
              type="text"
              className="form-input"
              style={{ borderRadius: 'var(--radius-full)', padding: '6px 14px', fontSize: 'var(--font-size-sm)' }}
              placeholder="Add a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submittingComment}
            />
            {newComment.trim() && (
              <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment}>
                Post
              </button>
            )}
          </form>

          {/* List */}
          {loadingComments && comments.length === 0 ? (
            <div className="spinner-wrapper" style={{ padding: '1rem' }}>
              <div className="spinner spinner-sm" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div
                    className="avatar avatar-sm"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', flexShrink: 0 }}
                  >
                    {(c.author_name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      background: 'var(--color-bg)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: 2 }}>
                      <Link
                        to={`/profile/${c.user_id ?? ''}`}
                        className="font-semibold text-xs"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {c.author_name ?? 'Unknown'}
                      </Link>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {c.content ?? ''}
                    </p>
                  </div>
                </div>
              ))}
              {commentsTotal > comments.length && (
                <button
                  type="button"
                  className="text-xs font-bold text-muted"
                  style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
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
