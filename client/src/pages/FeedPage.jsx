import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import SectionRow from '../components/SectionRow';
import PostCreationBox from '../components/PostCreationBox';
import PostCard from '../components/PostCard';
import ErrorBoundary from '../components/ErrorBoundary';

/* ═══ Helpers ═══════════════════════════════════════════════════════════ */

const POST_TYPES = [
  { value: 'general',        label: 'General' },
  { value: 'achievement',    label: 'Achievement' },
  { value: 'project_update', label: 'Project Update' },
  { value: 'research',       label: 'Research' },
];

const STATUS_BADGE = {
  open:        'badge-success',
  in_progress: 'badge-primary',
  completed:   'badge-muted',
};
const STATUS_LABEL = {
  open:        'Open',
  in_progress: 'In Progress',
  completed:   'Completed',
};
const PROJECT_COLORS = [
  'linear-gradient(90deg,#5b5ef4,#8b5cf6)',
  'linear-gradient(90deg,#0ea5e9,#5b5ef4)',
  'linear-gradient(90deg,#10b981,#0ea5e9)',
  'linear-gradient(90deg,#f59e0b,#ef4444)',
  'linear-gradient(90deg,#ec4899,#8b5cf6)',
];
const colorFor = (id) => PROJECT_COLORS[(id ?? 0) % PROJECT_COLORS.length];

const scoreBadgeClass = (score) => {
  if (score >= 0.7) return 'ml-badge ml-badge-green';
  if (score >= 0.4) return 'ml-badge ml-badge-amber';
  return 'ml-badge ml-badge-gray';
};

const avatarInitials = (name) =>
  (name ?? 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

/* ═══ Sub-cards ══════════════════════════════════════════════════════════ */

function ProjectCard({ project, score }) {
  return (
    <article className="project-disc-card">
      <div
        className="project-disc-banner"
        style={{ background: colorFor(project?.id) }}
      />
      <div className="project-disc-body">
        {score !== undefined && (
          <div style={{ marginBottom: 6 }}>
            <span className={scoreBadgeClass(score)}>
              🤖 {Math.round((score ?? 0) * 100)}% match
            </span>
          </div>
        )}
        <h3 className="project-disc-title">
          {project?.title ?? 'Untitled Project'}
        </h3>
        <p className="project-disc-desc">
          {project?.description
            ? project.description.length > 120
              ? `${project.description.slice(0, 120)}…`
              : project.description
            : 'No description provided.'}
        </p>
        {Array.isArray(project?.required_skills) && project.required_skills.length > 0 && (
          <div className="project-disc-tags">
            {project.required_skills.slice(0, 3).map((s) => (
              <span key={s} className="badge badge-secondary">{s}</span>
            ))}
            {project.required_skills.length > 3 && (
              <span className="badge badge-muted">+{project.required_skills.length - 3}</span>
            )}
          </div>
        )}
        <div className="project-disc-footer">
          <span className="project-disc-team">
            👥 {project?.current_team_size ?? 1}/{project?.max_team_size ?? '?'} members
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`badge ${STATUS_BADGE[project?.status] ?? 'badge-muted'}`}>
              {STATUS_LABEL[project?.status] ?? 'Unknown'}
            </span>
            <Link
              to={`/projects/${project?.id}`}
              className="btn btn-primary btn-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {score !== undefined ? 'View & Join' : 'View'}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function AchievementCard({ post }) {
  const authorName = post?.author_name ?? 'Unknown User';
  const initials = avatarInitials(authorName);
  return (
    <article className="achievement-disc-card">
      <div className="achievement-disc-author">
        <span className="avatar avatar-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
          {post?.author_avatar ? <img src={post.author_avatar} alt={authorName} /> : initials}
        </span>
        <div>
          <div className="achievement-disc-author-name">{authorName}</div>
          <div className="achievement-disc-author-role">
            {post?.created_at
              ? new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : ''}
          </div>
        </div>
        {post?.post_type && post.post_type !== 'general' && (
          <span
            className={`badge ${
              post.post_type === 'achievement' ? 'cat-hackathon' :
              post.post_type === 'research'    ? 'cat-research' :
              'badge-primary'
            }`}
            style={{ marginLeft: 'auto', flexShrink: 0 }}
          >
            {post.post_type === 'achievement' ? '🏆' : post.post_type === 'research' ? '🔬' : '📢'}
          </span>
        )}
      </div>
      <p className="achievement-disc-content">
        {post?.content ?? 'No content available.'}
      </p>
      <div className="achievement-disc-meta">
        <span>❤️ {post?.like_count ?? 0} likes</span>
        <span>💬 {post?.comment_count ?? 0} comments</span>
      </div>
    </article>
  );
}

function StudentCard({ user: student }) {
  const initials = avatarInitials(student?.name);
  const skills = Array.isArray(student?.skills) ? student.skills : [];
  return (
    <article className="student-disc-card">
      <span
        className="avatar avatar-lg"
        style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
      >
        {student?.avatar_url
          ? <img src={student.avatar_url} alt={student?.name ?? ''} />
          : initials}
      </span>
      <div className="student-disc-name">{student?.name ?? 'Unknown'}</div>
      <div className="student-disc-role">
        {student?.role === 'faculty' ? 'Faculty' : 'Student'}
        {student?.department ? ` · ${student.department}` : ''}
      </div>
      {skills.length > 0 && (
        <div className="student-disc-skills">
          {skills.slice(0, 3).map((s) => (
            <span key={s} className="badge badge-muted">{s}</span>
          ))}
          {skills.length > 3 && (
            <span className="badge badge-muted">+{skills.length - 3}</span>
          )}
        </div>
      )}
      <Link
        to={`/profile/${student?.id}`}
        className="btn btn-secondary btn-sm"
        style={{ marginTop: 4, width: '100%' }}
      >
        View Profile
      </Link>
    </article>
  );
}

/* ═══ Main Dashboard Page ════════════════════════════════════════════════ */

export default function FeedPage() {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────
  const [projects,       setProjects]       = useState([]);
  const [projectsLoading,setProjectsLoading]= useState(true);

  const [recommendations,      setRecommendations]      = useState([]);
  const [recsLoading,          setRecsLoading]           = useState(true);

  const [posts,          setPosts]          = useState([]);
  const [postsLoading,   setPostsLoading]   = useState(true);

  const [students,       setStudents]       = useState([]);
  const [studentsLoading,setStudentsLoading]= useState(true);

  const [feedPosts,      setFeedPosts]      = useState([]);
  const [feedLoading,    setFeedLoading]    = useState(true);
  const [feedPage,       setFeedPage]       = useState(1);
  const [feedTotalPages, setFeedTotalPages] = useState(1);
  const [feedLoadingMore,setFeedLoadingMore]= useState(false);
  const [feedSort,       setFeedSort]       = useState('trending');
  const [postError,      setPostError]      = useState('');

  // ── Fetch: Featured Projects ───────────────────────────────────
  useEffect(() => {
    axiosInstance
      .get('/projects', { params: { status: 'open', limit: 10 } })
      .then(({ data }) => setProjects(data?.data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setProjectsLoading(false));
  }, []);

  // ── Fetch: AI Recommendations (ML: student ↔ project) ─────────
  useEffect(() => {
    if (!user?.id) { setRecsLoading(false); return; }
    axiosInstance
      .get(`/users/${user.id}/recommendations`)
      .then(({ data }) => setRecommendations(data?.data ?? []))
      .catch(() => setRecommendations([]))
      .finally(() => setRecsLoading(false));
  }, [user?.id]);

  // ── Fetch: Trending Achievements (achievement posts) ───────────
  useEffect(() => {
    axiosInstance
      .get('/posts', { params: { sort: 'trending', limit: 8 } })
      .then(({ data }) => {
        const all = data?.data ?? [];
        const achievements = all.filter(
          (p) => p?.post_type === 'achievement' || p?.post_type === 'research'
        );
        setPosts(achievements.length > 0 ? achievements : all.slice(0, 6));
      })
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, []);

  // ── Fetch: Suggested Students (discovery) ─────────────────────
  useEffect(() => {
    // Filter by skills similar to logged-in user when available
    const skillFilter =
      Array.isArray(user?.skills) && user.skills.length > 0
        ? user.skills[0]
        : undefined;
    axiosInstance
      .get('/users', { params: { skill: skillFilter, limit: 10 } })
      .then(({ data }) => {
        const all = (data?.data ?? []).filter((u) => u?.id !== user?.id);
        setStudents(all);
      })
      .catch(() => setStudents([]))
      .finally(() => setStudentsLoading(false));
  }, [user?.id, user?.skills]);

  // ── Fetch: Main Feed ──────────────────────────────────────────
  const fetchFeed = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) setFeedLoading(true);
      else setFeedLoadingMore(true);
      setPostError('');
      try {
        const { data } = await axiosInstance.get('/posts', {
          params: { sort: feedSort, page: pageNum, limit: 10 },
        });
        const list = data?.data ?? [];
        const meta = data?.meta ?? {};
        if (append) setFeedPosts((prev) => [...prev, ...list]);
        else setFeedPosts(list);
        setFeedPage(meta.page ?? pageNum);
        setFeedTotalPages(meta.totalPages ?? 1);
      } catch (err) {
        setPostError(err.response?.data?.error?.message ?? 'Failed to load feed');
      } finally {
        setFeedLoading(false);
        setFeedLoadingMore(false);
      }
    },
    [feedSort]
  );

  useEffect(() => { fetchFeed(1, false); }, [fetchFeed]);

  // ── Feed handlers ─────────────────────────────────────────────
  const handleLike = (postId) =>
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, like_count: (p.like_count ?? 0) + 1, is_liked_by_user: 1 }
          : p
      )
    );
  const handleUnlike = (postId) =>
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, like_count: Math.max(0, (p.like_count ?? 0) - 1), is_liked_by_user: 0 }
          : p
      )
    );
  const handleCommentAdded = (postId) =>
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comment_count: (p.comment_count ?? 0) + 1 } : p
      )
    );
  const handleDeleted = (postId) =>
    setFeedPosts((prev) => prev.filter((p) => p.id !== postId));

  const handleCreatePost = async (content, type) => {
    setPostError('');
    try {
      const { data } = await axiosInstance.post('/posts', { content, postType: type });
      if (data?.data) setFeedPosts((prev) => [data.data, ...prev]);
    } catch (err) {
      setPostError(err.response?.data?.error?.message ?? 'Failed to create post');
    }
  };

  // ── Greeting ──────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="animate-fade-in">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="dashboard-hero">
        <div className="hero-greeting">
          {greeting}, {user?.name?.split(' ')[0] ?? 'Explorer'}! 👋
        </div>
        <p className="hero-sub">
          Discover projects, connect with collaborators, and show off your achievements.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">{projects.length || '—'}</span>
            <span className="hero-stat-label">Open Projects</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{recommendations.length || '—'}</span>
            <span className="hero-stat-label">Matched for You</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{students.length || '—'}</span>
            <span className="hero-stat-label">Suggested Peers</span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Featured Projects ─────────────────────── */}
      <SectionRow
        title="Featured Projects"
        icon="📁"
        subtitle="Open projects looking for collaborators"
        ctaLabel="Browse all"
        ctaTo="/projects"
        loading={projectsLoading}
        empty={
          <span>
            No open projects yet.{' '}
            <Link to="/projects/new" style={{ fontWeight: 700 }}>Create one →</Link>
          </span>
        }
      >
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </SectionRow>

      {/* ── Section 2: AI Recommendations ───────────────────── */}
      <SectionRow
        title="Recommended for You"
        icon="🤖"
        subtitle="AI-powered project matches based on your skills · TF-IDF + Cosine Similarity"
        ctaLabel="See all recs"
        ctaTo="/projects"
        loading={recsLoading}
        empty={
          <span>
            Add skills to your{' '}
            <Link to={`/profile/${user?.id}`} style={{ fontWeight: 700 }}>profile</Link>{' '}
            to get AI-powered project recommendations.
          </span>
        }
      >
        {recommendations.map(({ score, project }) =>
          project ? (
            <ProjectCard key={project.id} project={project} score={score} />
          ) : null
        )}
      </SectionRow>

      {/* ── Section 3: Trending Achievements ────────────────── */}
      <SectionRow
        title="Trending Achievements"
        icon="🏆"
        subtitle="Recent wins and research from the community"
        ctaLabel="View feed"
        ctaTo="/feed"
        loading={postsLoading}
        empty={<span>No achievements posted yet. Be the first!</span>}
      >
        {posts.map((post) => (
          <AchievementCard key={post.id} post={post} />
        ))}
      </SectionRow>

      {/* ── Section 4: Suggested Students ───────────────────── */}
      <SectionRow
        title="Suggested Students"
        icon="👥"
        subtitle="Students and faculty with similar skills"
        ctaLabel="Explore network"
        ctaTo="/search"
        loading={studentsLoading}
        empty={<span>No suggested students yet.</span>}
      >
        {students.map((student) => (
          <StudentCard key={student.id} user={student} />
        ))}
      </SectionRow>

      {/* ── Activity Feed ────────────────────────────────────── */}
      <section style={{ marginTop: 'var(--space-4)' }}>
        <div className="section-row-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="section-row-title">
              <span>📰</span>
              <span>Activity Feed</span>
            </div>
            <p className="section-row-subtitle">Posts from the SKIL Hub community</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Sort:</span>
            <select
              value={feedSort}
              onChange={(e) => setFeedSort(e.target.value)}
              style={{
                background: 'var(--color-bg-card)',
                border: '1.5px solid var(--color-border)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                cursor: 'pointer',
                outline: 'none',
                fontFamily: 'var(--font-family)',
              }}
            >
              <option value="trending">Trending</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>

        {/* Post creation */}
        <ErrorBoundary>
          <PostCreationBox onCreatePost={handleCreatePost} postTypes={POST_TYPES} />
        </ErrorBoundary>

        {postError && (
          <div className="card mb-4 text-danger text-sm font-semibold" style={{ marginBottom: 'var(--space-4)' }}>
            ⚠️ {postError}
          </div>
        )}

        {feedLoading ? (
          <div className="spinner-wrapper"><div className="spinner" /></div>
        ) : feedPosts.length === 0 ? (
          <div className="card text-center text-secondary" style={{ padding: '2rem' }}>
            No posts yet. Be the first to post! 🚀
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {feedPosts.map((post) => (
              <ErrorBoundary key={post.id}>
                <PostCard
                  post={post}
                  currentUserId={user?.id}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onCommentAdded={handleCommentAdded}
                  onDeleted={handleDeleted}
                />
              </ErrorBoundary>
            ))}
            {feedPage < feedTotalPages && (
              <button
                type="button"
                className="btn btn-ghost w-full font-semibold"
                onClick={() => fetchFeed(feedPage + 1, true)}
                disabled={feedLoadingMore}
              >
                {feedLoadingMore ? (
                  <><div className="spinner spinner-sm" /> Loading…</>
                ) : (
                  'Load more posts'
                )}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
