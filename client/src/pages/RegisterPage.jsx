import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
];

function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    department: '',
    year: '',
    bio: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/feed', { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.email.trim()) {
      setError('Please enter a valid email.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!form.department.trim()) {
      setError('Department is required.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        department: form.department.trim(),
        year: form.year.trim() || undefined,
        bio: form.bio.trim() || undefined,
      });
      navigate('/feed', { replace: true });
    } catch (err) {
      const res = err.response?.data;
      if (res?.error?.message) {
        setError(res.error.message);
      } else if (res?.error?.details?.length) {
        setError(
          res.error.details.map((d) => d.msg || d.message).join('. ')
        );
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="card">
          <h1 className="page-heading">Create account</h1>
          <p className="page-subheading">Join SKIL Hub to showcase your work and connect.</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="form-error mb-4" role="alert">
                {error}
              </div>
            )}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Name</label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                autoComplete="name"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
              <input
                id="reg-confirm"
                type="password"
                className="form-input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                className="form-input"
                value={form.role}
                onChange={(e) => update('role', e.target.value)}
                disabled={loading}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-department">Department</label>
              <input
                id="reg-department"
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science"
                value={form.department}
                onChange={(e) => update('department', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-year">Year (optional)</label>
              <input
                id="reg-year"
                type="text"
                className="form-input"
                placeholder="e.g. 3rd Year"
                value={form.year}
                onChange={(e) => update('year', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-bio">Bio (optional)</label>
              <textarea
                id="reg-bio"
                className="form-input form-textarea"
                placeholder="Short intro..."
                value={form.bio}
                onChange={(e) => update('bio', e.target.value)}
                rows={3}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-sm text-secondary mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
