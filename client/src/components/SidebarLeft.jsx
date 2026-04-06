import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const NAV_ITEMS = [
  { to: '/feed',          icon: '🏠', label: 'Home' },
  { to: '/projects',      icon: '📁', label: 'Projects' },
  { to: '/search',        icon: '🔍', label: 'Explore' },
  { to: '/notifications', icon: '🔔', label: 'Alerts', badge: true },
  { to: '/messages/0',    icon: '💬', label: 'Messages' },
];

export default function SidebarLeft() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  if (!user) return null;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="app-sidebar animate-slide-right">
      {/* ── Nav Items ── */}
      {NAV_ITEMS.map(({ to, icon, label, badge }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `sidebar-nav-item${isActive ? ' active' : ''}`
          }
          title={label}
          end={to === '/feed'}
        >
          <span className="sidebar-nav-icon">{icon}</span>
          <span className="sidebar-nav-label">{label}</span>
          {badge && unreadCount > 0 && (
            <span className="sidebar-badge">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>
      ))}

      {/* ── Divider ── */}
      <div className="sidebar-divider" />

      {/* ── Profile Avatar ── */}
      <NavLink
        to={`/profile/${user.id}`}
        className={({ isActive }) =>
          `sidebar-nav-item${isActive ? ' active' : ''}`
        }
        title={user.name ?? 'Profile'}
      >
        <span className="avatar avatar-sm">
          {user.avatar_url
            ? <img src={user.avatar_url} alt={user.name ?? ''} />
            : initials}
        </span>
        <span className="sidebar-nav-label">Profile</span>
      </NavLink>
    </aside>
  );
}
