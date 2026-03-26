import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import PostCard from '../components/PostCard';
import PostCreationBox from '../components/PostCreationBox';

const POST_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'project_update', label: 'Project Update' },
  { value: 'research', label: 'Research' },
];

export default function FeedPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState('trending');
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

  const handleCreatePost = async (content, type) => {
    setError('');
    try {
      const { data } = await axiosInstance.post('/posts', {
        content,
        postType: type,
      });
      setPosts((prev) => [data.data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create post');
    }
  };

  return (
    <div className="grid-3-col">
      <SidebarLeft />

      <main className="feed-column">
        <PostCreationBox onCreatePost={handleCreatePost} postTypes={POST_TYPES} />
        
        {error && <div className="card mb-4 text-danger text-sm font-semibold">{error}</div>}

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-[1px] bg-border"></div>
          <span className="text-xs text-muted">
            Sort by: 
            <select 
              className="bg-transparent border-none text-xs font-bold text-primary cursor-pointer outline-none"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="trending">Trending</option>
              <option value="recent">Recent</option>
            </select>
          </span>
        </div>

        {loading ? (
          <div className="spinner-wrapper py-8"><div className="spinner" /></div>
        ) : posts.length === 0 ? (
          <div className="card text-center text-secondary p-8 bg-white">No posts yet. Be the first to post!</div>
        ) : (
          <div className="flex flex-col gap-2">
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
                className="btn btn-ghost w-full font-bold text-muted hover:bg-zinc-100"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </div>
        )}
      </main>

      <SidebarRight />
    </div>
  );
}
