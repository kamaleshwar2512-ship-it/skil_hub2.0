import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const TABS = [
  { id: 'all', label: '🗂 All Projects' },
  { id: 'foryou', label: '✨ For You (AI)' },
];

export default function ProjectsPage() {
  const { user } = useAuth();

  // ── All Projects tab state ──────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('');
  const [skill, setSkill] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // ── For You tab state ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState('all');
  const [recs, setRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState('');
  const [recsMessage, setRecsMessage] = useState('');

  // ── Fetch all projects ─────────────────────────────────────
  const fetchProjects = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/projects', {
        params: {
          status: status || undefined,
          skill: skill || undefined,
          page: pageNum,
          limit: 10,
        },
      });
      const list = data.data || [];
      const meta = data.meta || {};
      if (append) {
        setProjects((prev) => [...prev, ...list]);
      } else {
        setProjects(list);
      }
      setPage(meta.page ?? pageNum);
      setTotalPages(meta.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ── Fetch AI recommendations ───────────────────────────────
  const fetchRecommendations = async () => {
    if (!user?.id) return;
    setRecsLoading(true);
    setRecsError('');
    setRecsMessage('');
    try {
      const { data } = await axiosInstance.get(`/users/${user.id}/recommendations`);
      const list = data.data || [];
      // Backend may return a message (e.g., "No skills on profile")
      if (data.meta?.message) setRecsMessage(data.meta.message);
      setRecs(list);
    } catch (err) {
      setRecsError(
        err.response?.data?.error?.message || 'Failed to load recommendations'
      );
    } finally {
      setRecsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Load AI recs when user switches to the For You tab
  useEffect(() => {
    if (activeTab === 'foryou' && recs.length === 0 && !recsLoading) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProjects(1, false);
  };

  const loadMore = () => {
    if (page >= totalPages || loadingMore) return;
    fetchProjects(page + 1, true);
  };

  const statusBadgeClass = (s) => {
    if (s === 'open') return 'badge-success';
    if (s === 'in_progress') return 'badge-primary';
    if (s === 'completed') return 'badge-muted';
    return 'badge-muted';
  };

  const statusLabel = (s) => {
    if (s === 'open') return 'Open';
    if (s === 'in_progress') return 'In Progress';
    return 'Completed';
  };

  // Score → colour: green ≥ 0.7, yellow ≥ 0.4, grey below
  const scoreBadgeStyle = (score) => {
    if (score >= 0.7) return { background: '#16a34a', color: '#fff' };
    if (score >= 0.4) return { background: '#d97706', color: '#fff' };
    return { background: '#6b7280', color: '#fff' };
  };

  return (
    <div className="content-container">
      {/* ── Page header ── */}
      <div className="projects-header">
        <div>
          <h1 className="page-heading">Projects</h1>
          <p className="page-subheading">
            Discover student projects and find teams to collaborate with.
          </p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          Create Project
        </Link>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.45rem 1.1rem',
              borderRadius: '9999px',
              border: '2px solid',
              borderColor: activeTab === tab.id ? 'var(--color-primary, #6366f1)' : 'transparent',
              background: activeTab === tab.id ? 'var(--color-primary, #6366f1)' : 'var(--color-card, #1e293b)',
              color: activeTab === tab.id ? '#fff' : 'var(--color-secondary, #94a3b8)',
              fontWeight: activeTab === tab.id ? 700 : 400,
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 1 — ALL PROJECTS                                  */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'all' && (
        <>
          {/* Filters */}
          <div className="card mb-6">
            <form className="projects-filters" onSubmit={handleFilterSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  className="form-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="skill">
                  Filter by Skill
                </label>
                <input
                  id="skill"
                  className="form-input"
                  placeholder="e.g. React"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                />
              </div>
              <div className="projects-filters-actions">
                <button type="submit" className="btn btn-secondary">
                  Apply
                </button>
              </div>
            </form>
          </div>

          {/* Project list */}
          {loading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
            </div>
          ) : error ? (
            <div className="card">
              <p className="form-error">{error}</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="card text-center text-secondary p-4">
              No projects found. Be the first to create one!
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((project) => (
                <article key={project.id} className="card project-card">
                  <div className="project-card-header">
                    <h2 className="project-title">
                      <Link to={`/projects/${project.id}`}>{project.title}</Link>
                    </h2>
                    <span className={`badge ${statusBadgeClass(project.status)}`}>
                      {statusLabel(project.status)}
                    </span>
                  </div>
                  <p className="project-description">
                    {project.description?.length > 180
                      ? `${project.description.slice(0, 180)}…`
                      : project.description}
                  </p>
                  <div className="project-meta-row">
                    <span className="text-xs text-secondary">
                      Team: {project.current_team_size ?? 1}/{project.max_team_size ?? '?'}
                    </span>
                  </div>
                  {Array.isArray(project.required_skills) &&
                    project.required_skills.length > 0 && (
                      <div className="project-tags">
                        {project.required_skills.map((s) => (
                          <span key={s} className="badge badge-secondary">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  <div className="project-card-footer">
                    <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-sm">
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && page < totalPages && (
            <button
              type="button"
              className="btn btn-secondary w-full mt-4"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Loading…' : 'Load more projects'}
            </button>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 2 — FOR YOU (AI RECOMMENDATIONS)                  */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'foryou' && (
        <>
          {/* AI banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1.1rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#fff',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                🤖 AI Skill Matchmaking
              </div>
              <div style={{ fontSize: '0.78rem', opacity: 0.85 }}>
                Projects ranked by how well your skills match their requirements · TF-IDF + Cosine Similarity
              </div>
            </div>
            <button
              type="button"
              onClick={fetchRecommendations}
              disabled={recsLoading}
              style={{
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#fff',
                borderRadius: '0.5rem',
                padding: '0.4rem 0.9rem',
                cursor: recsLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              {recsLoading ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>

          {/* States */}
          {recsLoading ? (
            <div className="spinner-wrapper">
              <div className="spinner" />
            </div>
          ) : recsError ? (
            <div className="card">
              <p className="form-error">{recsError}</p>
            </div>
          ) : recsMessage && recs.length === 0 ? (
            <div className="card text-center" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
              <p style={{ fontWeight: 600 }}>{recsMessage}</p>
              <p className="text-secondary text-sm mt-2">
                Go to <Link to="/profile" style={{ textDecoration: 'underline' }}>your profile</Link> and add skills to get personalised project recommendations.
              </p>
            </div>
          ) : recs.length === 0 ? (
            <div className="card text-center text-secondary p-4">
              No matching projects found right now. Try adding more skills to your profile.
            </div>
          ) : (
            <>
              <p className="text-secondary text-sm mb-4">
                Showing <strong>{recs.length}</strong> project{recs.length !== 1 ? 's' : ''} matched to your skills
              </p>
              <div className="projects-grid">
                {recs.map(({ score, project }) => (
                  <article key={project.id} className="card project-card" style={{ position: 'relative' }}>
                    {/* AI Match Score badge */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        borderRadius: '9999px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        ...scoreBadgeStyle(score),
                      }}
                    >
                      {Math.round(score * 100)}% match
                    </span>

                    <div className="project-card-header" style={{ paddingRight: '5rem' }}>
                      <h2 className="project-title">
                        <Link to={`/projects/${project.id}`}>{project.title}</Link>
                      </h2>
                      <span className={`badge ${statusBadgeClass(project.status)}`}>
                        {statusLabel(project.status)}
                      </span>
                    </div>

                    <p className="project-description">
                      {project.description?.length > 180
                        ? `${project.description.slice(0, 180)}…`
                        : project.description}
                    </p>

                    <div className="project-meta-row">
                      <span className="text-xs text-secondary">
                        Team: {project.current_team_size ?? 1}/{project.max_team_size ?? '?'}
                      </span>
                    </div>

                    {Array.isArray(project.required_skills) &&
                      project.required_skills.length > 0 && (
                        <div className="project-tags">
                          {project.required_skills.map((s) => (
                            <span key={s} className="badge badge-secondary">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                    <div className="project-card-footer">
                      <Link to={`/projects/${project.id}`} className="btn btn-primary btn-sm">
                        View & Join
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
