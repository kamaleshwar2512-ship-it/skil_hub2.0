import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function EditProfilePage() {
  const { user, updateUserCache } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bio: '',
    skills: '',
    department: '',
    year: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      setError('');
      try {
        const { data } = await axiosInstance.get('/users/me');
        const profile = data.data;
        setForm({
          bio: profile.bio || '',
          skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '',
          department: profile.department || '',
          year: profile.year || '',
          avatarUrl: profile.avatar_url || '',
        });
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        bio: form.bio.trim() || undefined,
        skills: form.skills
          ? form.skills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        department: form.department.trim() || undefined,
        year: form.year.trim() || undefined,
        avatarUrl: form.avatarUrl.trim() || undefined,
      };

      const { data } = await axiosInstance.put('/users/me', payload);
      const updated = data.data;
      updateUserCache(updated);
      navigate(`/profile/${updated.id ?? user?.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
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

  return (
    <div className="content-container">
      <h1 className="page-heading">Edit Profile</h1>
      <p className="page-subheading mb-6">Update how others see you on SKIL Hub.</p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error mb-4">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="bio">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-input form-textarea"
              rows={4}
              maxLength={500}
              placeholder="Tell others about your interests, experience, and goals."
              value={form.bio}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="skills">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              className="form-input"
              placeholder="e.g. React, Python, Machine Learning"
              value={form.skills}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="department">
              Department
            </label>
            <input
              id="department"
              name="department"
              type="text"
              className="form-input"
              placeholder="e.g. Computer Science"
              value={form.department}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="year">
              Year
            </label>
            <input
              id="year"
              name="year"
              type="text"
              className="form-input"
              placeholder="e.g. 3rd Year"
              value={form.year}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="avatarUrl">
              Avatar URL
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              className="form-input"
              placeholder="Link to your profile picture"
              value={form.avatarUrl}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
