import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('');
  const [skill, setSkill] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchProjects(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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

  return (
    <div className="content-container">
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
                  {project.status === 'open'
                    ? 'Open'
                    : project.status === 'in_progress'
                    ? 'In Progress'
                    : 'Completed'}
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
              {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
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
    </div>
  );
}
