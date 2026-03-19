import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const { data } = await axiosInstance.get(`/users/${id}`);
        setProfile(data.data);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  if (loading) {
    return (
      <div className="content-container">
        <div className="spinner-wrapper">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-container">
        <div className="card">
          <p className="form-error mb-4">{error}</p>
          <Link to="/feed" className="btn btn-secondary">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="content-container">
        <div className="card">
          <p className="text-secondary">Profile not found.</p>
        </div>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const skills = Array.isArray(profile.skills) ? profile.skills : profile.skills ? [profile.skills] : [];

  return (
    <div className="content-container">
      <div className="card profile-header">
        <div className="profile-header-main">
          <div className="avatar avatar-xl profile-avatar">
            {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.name} /> : initials}
          </div>
          <div className="profile-meta">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-subtitle">
              {profile.department && <span>{profile.department}</span>}
              {profile.year && <span> · {profile.year}</span>}
            </p>
            {profile.email && <p className="text-sm text-secondary">{profile.email}</p>}
          </div>
        </div>
        {isOwnProfile && (
          <div className="profile-actions">
            <Link to="/profile/edit" className="btn btn-secondary btn-sm">
              Edit Profile
            </Link>
          </div>
        )}
      </div>

      <div className="profile-grid">
        <section className="card profile-section">
          <h2 className="profile-section-title">About</h2>
          <p className="profile-bio">
            {profile.bio ? profile.bio : <span className="text-secondary">No bio added yet.</span>}
          </p>
        </section>

        <section className="card profile-section">
          <h2 className="profile-section-title">Skills</h2>
          {skills.length === 0 ? (
            <p className="text-secondary text-sm">No skills listed yet.</p>
          ) : (
            <div className="profile-skill-list">
              {skills.map((skill) => (
                <span key={skill} className="badge badge-secondary">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
