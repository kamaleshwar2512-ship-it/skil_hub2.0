import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* ── Brand ── */}
        <Link to="/feed" className="navbar-brand">
          <div className="navbar-logo-icon">S</div>
          <span className="navbar-title">SKIL Hub</span>
        </Link>

        {/* ── Centered Search ── */}
        <form onSubmit={handleSearch} className="navbar-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search projects, students, achievements…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* ── Right Actions ── */}
        <div className="navbar-right">

          {/* Notifications Icon Button */}
          <NavLink
            to="/notifications"
            className={({ isActive }) => `navbar-icon-btn${isActive ? ' active' : ''}`}
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>

          {/* Profile Dropdown */}
          <div className="navbar-profile-menu" ref={dropdownRef}>
            <button
              type="button"
              className="navbar-me-btn"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <span className="avatar avatar-sm">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
              </span>
              <span>{user?.name?.split(' ')[0] || 'Me'} ⌄</span>
            </button>

            <div className={`profile-dropdown ${dropdownOpen ? 'profile-dropdown-open' : ''}`}>
              <div className="dropdown-header">
                <span className="avatar avatar-lg">
                  {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
                </span>
                <div className="dropdown-user-info">
                  <p className="name">{user?.name ?? 'Unknown User'}</p>
                  <p className="headline">
                    {user?.role === 'faculty' ? 'Faculty' : 'Student'}
                    {user?.department ? ` @ ${user.department}` : ''}
                  </p>
                </div>
              </div>

              <Link
                to={`/profile/${user?.id}`}
                className="view-profile-btn"
                onClick={() => setDropdownOpen(false)}
              >
                View Profile
              </Link>

              <div className="dropdown-section">
                <p className="dropdown-section-title">Account</p>
                <Link to="/profile/edit" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  ⚙️ Settings & Privacy
                </Link>
              </div>

              <div className="dropdown-section">
                <p className="dropdown-section-title">Manage</p>
                <Link to="/projects" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  📁 My Projects
                </Link>
                <Link to="/messages/0" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  💬 Messages
                </Link>
              </div>

              <div className="dropdown-item-signout">
                <button onClick={handleLogout} className="dropdown-item" style={{ color: 'var(--color-danger)' }}>
                  🚪 Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
