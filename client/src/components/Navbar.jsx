import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import './Navbar.css';

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

  const navLinkClass = ({ isActive }) =>
    `navbar-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="flex items-center gap-2 flex-1">
          <Link to="/feed" className="navbar-brand">
            <span className="navbar-title">SKIL Hub</span>
          </Link>

          <form onSubmit={handleSearch} className="navbar-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search researchers, projects, or achievements"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="navbar-links">
          <NavLink to="/feed" className={navLinkClass}>
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </NavLink>
          <NavLink to="/network" className={navLinkClass}>
            <span className="nav-icon">👥</span>
            <span>My Network</span>
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <span className="nav-icon">📁</span>
            <span>Projects</span>
          </NavLink>
          <NavLink to="/notifications" className={navLinkClass}>
            <div className="relative">
              <span className="nav-icon">🔔</span>
              {unreadCount > 0 && (
                <span className="notification-badge" style={{ top: -2, right: -2 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span>Notifications</span>
          </NavLink>
        </div>

        <div className="navbar-right">
          <div className="navbar-profile-menu" ref={dropdownRef}>
            <button
              type="button"
              className="navbar-me-btn"
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <span className="avatar avatar-sm">
                {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
              </span>
              <span>Me ⌄</span>
            </button>
            <div className={`profile-dropdown ${dropdownOpen ? 'profile-dropdown-open' : ''}`}>
              <div className="dropdown-header">
                <span className="avatar avatar-lg">
                  {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials}
                </span>
                <div className="dropdown-user-info">
                  <p className="name">{user?.name}</p>
                  <p className="headline">{user?.role === 'faculty' ? 'Faculty' : 'Student'} @ {user?.department}</p>
                </div>
              </div>
              <Link to={`/profile/${user?.id}`} className="view-profile-btn" onClick={() => setDropdownOpen(false)}>
                View Profile
              </Link>
              
              <div className="dropdown-section">
                <p className="dropdown-section-title">Account</p>
                <Link to="/profile/edit" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Settings & Privacy
                </Link>
                <Link to="/help" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Help
                </Link>
              </div>

              <div className="dropdown-section">
                <p className="dropdown-section-title">Manage</p>
                <Link to="/projects/my" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Posts & Activity
                </Link>
                <Link to="/projects/job-postings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  Project Invitations
                </Link>
              </div>

              <div className="dropdown-item-signout">
                <button onClick={handleLogout} className="dropdown-item">
                  Sign Out
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
