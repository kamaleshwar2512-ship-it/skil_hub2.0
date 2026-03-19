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

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const navLinkClass = ({ isActive }) =>
    `navbar-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/feed" className="navbar-brand">
          <span className="navbar-logo">🎓</span>
          <span className="navbar-title">SKIL Hub</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/feed" className={navLinkClass}>Feed</NavLink>
          <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
          <NavLink to="/search" className={navLinkClass}>Search</NavLink>
        </div>

        <div className="navbar-right">
          <Link to="/notifications" className="navbar-icon-btn" title="Notifications">
            <span className="bell-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="navbar-profile-menu" ref={dropdownRef}>
            <button
              type="button"
              className="avatar avatar-sm navbar-avatar"
              onClick={() => setDropdownOpen((o) => !o)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              title="Profile menu"
            >
              {initials}
            </button>
            <div className={`profile-dropdown ${dropdownOpen ? 'profile-dropdown-open' : ''}`}>
              <div className="dropdown-header">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-muted">{user?.department}</p>
              </div>
              <Link to={`/profile/${user?.id}`} className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                My Profile
              </Link>
              <Link to="/profile/edit" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                Edit Profile
              </Link>
              <hr className="dropdown-divider" />
              <button onClick={handleLogout} className="dropdown-item dropdown-item-danger">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
