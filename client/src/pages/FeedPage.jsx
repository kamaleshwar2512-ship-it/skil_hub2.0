import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const POST_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'project_update', label: 'Project Update' },
  { value: 'research', label: 'Research' },
];

function PostCard({ post, currentUserId, onLike, onUnlike, onCommentAdded, onDeleted }) {
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

  const authorInitials = post.author_name
    ? post.author_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const createdAt = post.created_at
    ? new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })
    : '';

  return (
    <article className="card feed-post">
      <div className="feed-post-header">
        <Link to={`/profile/${post.user_id}`} className="feed-post-author">
          <span className="avatar avatar-md">
            {post.author_avatar ? (
              <img src={post.author_avatar} alt="" />
            ) : (
              authorInitials
            )}
          </span>
          <div>
            <span className="font-semibold">{post.author_name}</span>
            {post.author_department && (
              <span className="text-xs text-muted"> · {post.author_department}</span>
            )}
            <div className="text-xs text-muted">{createdAt}</div>
          </div>
        </Link>
        {isOwner && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? '…' : 'Delete'}
          </button>
        )}
      </div>
      <div className="feed-post-content">{post.content}</div>
      <div className="feed-post-actions">
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${isLiked ? 'text-accent' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? '♥' : '♡'} {post.like_count ?? 0}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.comment_count ?? 0}
        </button>
      </div>
      {showComments && (
        <div className="feed-post-comments">
          {loadingComments && comments.length === 0 ? (
            <div className="spinner-wrapper"><div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} /></div>
          ) : (
            <>
              {comments.map((c) => (
                <div key={c.id} className="feed-comment">
                  <Link to={`/profile/${c.user_id}`} className="font-semibold text-sm">{c.author_name}</Link>
                  <span className="text-sm text-secondary"> · {c.content}</span>
                </div>
              ))}
              {commentsTotal > comments.length && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => fetchComments(commentsPage + 1)}
                  disabled={loadingComments}
                >
                  {loadingComments ? 'Loading…' : 'Load more comments'}
                </button>
              )}
              <form onSubmit={handleSubmitComment} className="flex gap-2 mt-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={!newComment.trim() || submittingComment}>
                  Post
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState('trending');
  const [createContent, setCreateContent] = useState('');
  const [createType, setCreateType] = useState('general');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/posts', {
        params: { sort, page: pageNum, limit: 10 },
      });
      const list = data.data || [];
      const meta = data.meta || {};
      if (append) {
        setPosts((prev) => [...prev, ...list]);
      } else {
        setPosts(list);
      }
      setPage(meta.page ?? pageNum);
      setTotalPages(meta.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load feed');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchFeed(1, false);
  }, [fetchFeed]);

  const loadMore = () => {
    if (page >= totalPages || loadingMore) return;
    fetchFeed(page + 1, true);
  };

  const handleLike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, like_count: (p.like_count || 0) + 1, is_liked_by_user: 1 } : p
      )
    );
  };
  const handleUnlike = (postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, like_count: Math.max(0, (p.like_count || 0) - 1), is_liked_by_user: 0 } : p
      )
    );
  };
  const handleCommentAdded = (postId) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p))
    );
  };
  const handleDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!createContent.trim() || creating) return;
    setCreating(true);
    setError('');
    try {
      const { data } = await axiosInstance.post('/posts', {
        content: createContent.trim(),
        postType: createType,
      });
      setPosts((prev) => [data.data, ...prev]);
      setCreateContent('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="content-container">
      <h1 className="page-heading">Feed</h1>
      <p className="page-subheading mb-6">Share updates and see what others are doing.</p>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          className={`btn ${sort === 'trending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSort('trending')}
        >
          Trending
        </button>
        <button
          type="button"
          className={`btn ${sort === 'recent' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSort('recent')}
        >
          Recent
        </button>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleCreatePost}>
          {error && <div className="form-error mb-4">{error}</div>}
          <div className="form-group">
            <textarea
              className="form-input form-textarea"
              placeholder="What's on your mind?"
              value={createContent}
              onChange={(e) => setCreateContent(e.target.value)}
              maxLength={2000}
              rows={3}
              disabled={creating}
            />
            <div className="flex justify-between items-center mt-2">
              <select
                className="form-input"
                style={{ width: 'auto' }}
                value={createType}
                onChange={(e) => setCreateType(e.target.value)}
                disabled={creating}
              >
                {POST_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!createContent.trim() || creating}
              >
                {creating ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="spinner-wrapper"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="card text-center text-secondary p-8">No posts yet. Be the first to post!</div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onCommentAdded={handleCommentAdded}
              onDeleted={handleDeleted}
            />
          ))}
          {page < totalPages && (
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
