import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredSkills: '',
    maxTeamSize: 4,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'maxTeamSize' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        requiredSkills: form.requiredSkills
          ? form.requiredSkills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        maxTeamSize: form.maxTeamSize || undefined,
      };
      const { data } = await axiosInstance.post('/projects', payload);
      const created = data.data;
      navigate(`/projects/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="content-container">
      <h1 className="page-heading">Create Project</h1>
      <p className="page-subheading mb-6">
        Describe your idea, required skills, and team size to find collaborators.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error mb-4">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="Project title"
              value={form.title}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              className="form-input form-textarea"
              rows={5}
              placeholder="What are you building? What problems does it solve?"
              value={form.description}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="requiredSkills">
              Required Skills (comma separated)
            </label>
            <input
              id="requiredSkills"
              name="requiredSkills"
              type="text"
              className="form-input"
              placeholder="e.g. React, Node.js, Data Science"
              value={form.requiredSkills}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="maxTeamSize">
              Max Team Size
            </label>
            <input
              id="maxTeamSize"
              name="maxTeamSize"
              type="number"
              min={1}
              max={20}
              className="form-input"
              value={form.maxTeamSize}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/projects')}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
