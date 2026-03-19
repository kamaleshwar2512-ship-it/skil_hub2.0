import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [skill, setSkill] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/users', {
        params: {
          q: query || undefined,
          department: department || undefined,
          skill: skill || undefined,
          page: 1,
          limit: 25,
        },
      });
      setResults(data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to run search');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-container">
      <h1 className="page-heading">Search</h1>
      <p className="page-subheading mb-6">
        Find students by name, department, or skills to collaborate with.
      </p>

      <div className="card mb-6">
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="q">
              Name or keyword
            </label>
            <input
              id="q"
              className="form-input"
              placeholder="Search by name, bio, or skills"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="search-row">
            <div className="form-group">
              <label className="form-label" htmlFor="department">
                Department
              </label>
              <input
                id="department"
                className="form-input"
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="skill">
                Skill
              </label>
              <input
                id="skill"
                className="form-input"
                placeholder="e.g. React"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </div>
          </div>

          <div className="search-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="card mb-4">
          <p className="form-error">{error}</p>
        </div>
      )}

      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="card">
          <h2 className="profile-section-title mb-4">Results</h2>
          <ul className="search-results-list">
            {results.map((u) => {
              const skills = Array.isArray(u.skills) ? u.skills : u.skills ? [u.skills] : [];
              return (
                <li key={u.id} className="search-result-row">
                  <div>
                    <Link to={`/profile/${u.id}`} className="font-medium">
                      {u.name}
                    </Link>
                    <div className="text-xs text-secondary">
                      {u.department}
                      {u.year && ` · ${u.year}`}
                    </div>
                    {skills.length > 0 && (
                      <div className="search-result-tags">
                        {skills.slice(0, 5).map((s) => (
                          <span key={s} className="badge badge-secondary">
                            {s}
                          </span>
                        ))}
                        {skills.length > 5 && (
                          <span className="badge badge-muted">+{skills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="text-secondary text-sm">Use the filters above to search the student network.</p>
      )}
    </div>
  );
}
