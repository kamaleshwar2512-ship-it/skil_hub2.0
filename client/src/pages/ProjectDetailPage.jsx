import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [managing, setManaging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const isOwner =
    project &&
    Array.isArray(project.members) &&
    project.members.some((m) => m.role === 'owner' && m.user_id === user?.id);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      setError('');
      try {
        const { data } = await axiosInstance.get(`/projects/${id}`);
        setProject(data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProject();
    }
  }, [id]);

  const handleJoin = async () => {
    if (joining) return;
    setJoining(true);
    setError('');
    try {
      await axiosInstance.post(`/projects/${id}/join`);
      // Optimistically mark current user as pending member
      setProject((prev) =>
        prev
          ? {
              ...prev,
              members: [
                ...(prev.members || []),
                { user_id: user.id, role: 'member', status: 'pending', name: user.name },
              ],
            }
          : prev
      );
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to request to join');
    } finally {
      setJoining(false);
    }
  };

  const handleMemberAction = async (memberId, action) => {
    if (managing) return;
    setManaging(true);
    setError('');
    try {
      await axiosInstance.put(`/projects/${id}/members/${memberId}`, { action });
      setProject((prev) =>
        prev
          ? {
              ...prev,
              members: (prev.members || []).map((m) =>
                m.user_id === memberId ? { ...m, status: action === 'accept' ? 'accepted' : 'rejected' } : m
              ),
            }
          : prev
      );
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update member');
    } finally {
      setManaging(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      await axiosInstance.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete project');
      setDeleting(false);
    }
  };

  const loadRecommendations = async () => {
    if (loadingRecs) return;
    setLoadingRecs(true);
    setError('');
    try {
      const { data } = await axiosInstance.get(`/projects/${id}/recommendations`);
      setRecommendations(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load recommendations');
    } finally {
      setLoadingRecs(false);
    }
  };

  if (loading) {
    return (
      <div className="content-container">
        <div className="spinner-wrapper">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="content-container">
        <div className="card">
          <p className="form-error mb-4">{error}</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/projects')}>
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="content-container">
        <div className="card">
          <p className="text-secondary">Project not found.</p>
        </div>
      </div>
    );
  }

  const statusLabel =
    project.status === 'open'
      ? 'Open'
      : project.status === 'in_progress'
      ? 'In Progress'
      : 'Completed';

  const pendingMembers = (project.members || []).filter((m) => m.status === 'pending');
  const acceptedMembers = (project.members || []).filter((m) => m.status === 'accepted');

  return (
    <div className="content-container">
      <div className="project-detail-header card">
        <div>
          <h1 className="page-heading">{project.title}</h1>
          <p className="project-detail-subtitle">
            <span className="badge badge-primary">{statusLabel}</span>
            <span className="text-xs text-secondary">
              &nbsp; · Team {project.current_team_size ?? 1}/{project.max_team_size ?? '?'}
            </span>
          </p>
        </div>
        <div className="project-detail-actions">
          {isOwner ? (
            <>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadRecommendations}
                disabled={loadingRecs}
              >
                {loadingRecs ? 'Loading…' : 'ML Recommendations'}
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete Project'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? 'Requesting…' : 'Request to Join'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="card mb-4">
          <p className="form-error">{error}</p>
        </div>
      )}

      <div className="project-detail-grid">
        <section className="card">
          <h2 className="profile-section-title">Overview</h2>
          <p className="project-detail-description">{project.description}</p>

          {Array.isArray(project.required_skills) && project.required_skills.length > 0 && (
            <>
              <div className="divider" />
              <h3 className="profile-section-title">Required Skills</h3>
              <div className="project-tags">
                {project.required_skills.map((s) => (
                  <span key={s} className="badge badge-secondary">
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="profile-section-title">Team</h2>
          {acceptedMembers.length === 0 ? (
            <p className="text-secondary text-sm">No accepted members yet.</p>
          ) : (
            <ul className="project-members-list">
              {acceptedMembers.map((m) => (
                <li key={m.user_id} className="project-member-row">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-xs text-secondary">{m.role === 'owner' ? 'Owner' : 'Member'}</span>
                </li>
              ))}
            </ul>
          )}

          {isOwner && pendingMembers.length > 0 && (
            <>
              <div className="divider" />
              <h3 className="profile-section-title">Pending Requests</h3>
              <ul className="project-members-list">
                {pendingMembers.map((m) => (
                  <li key={m.user_id} className="project-member-row">
                    <span className="font-medium">{m.name}</span>
                    <div className="project-member-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMemberAction(m.user_id, 'accept')}
                        disabled={managing}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleMemberAction(m.user_id, 'reject')}
                        disabled={managing}
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {isOwner && recommendations.length > 0 && (
        <section className="card mt-4">
          <h2 className="profile-section-title">Recommended Collaborators</h2>
          <ul className="project-members-list">
            {recommendations.map((rec) => (
              <li key={rec.user.id} className="project-member-row">
                <div>
                  <div className="font-medium">{rec.user.name}</div>
                  <div className="text-xs text-secondary">
                    {rec.user.department} · Score {(rec.score * 100).toFixed(0)}%
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
