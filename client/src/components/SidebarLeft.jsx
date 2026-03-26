import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SidebarLeft() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar-left">
      <div className="card sidebar-profile-card">
        <div className="profile-card-header"></div>
        <div className="profile-card-info">
          <Link to={`/profile/${user.id}`} className="avatar avatar-lg profile-card-avatar">
            {user.avatar_url ? <img src={user.avatar_url} alt={user.name} /> : initials}
          </Link>
          <Link to={`/profile/${user.id}`} className="profile-card-name">
            {user.name}
          </Link>
          <p className="profile-card-headline">
            {user.role === 'faculty' ? 'Faculty' : 'Student'} @ {user.department || 'SKIL Hub'}
          </p>
        </div>
        
        <div className="profile-card-metrics">
          <div className="metric-row">
            <span className="metric-label">Profile views</span>
            <span className="metric-value">42</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Post impressions</span>
            <span className="metric-value">128</span>
          </div>
        </div>

        <div className="divider" style={{ margin: 0 }}></div>
        
        <div className="p-4 text-left">
          <Link to="/saved" className="text-xs font-semibold text-secondary hover:underline">
            🔖 Saved items
          </Link>
        </div>
      </div>

      <div className="card sidebar-sticky-box">
        <h3 className="text-xs font-bold text-muted mb-3 uppercase tracking-wider">Recent Groups</h3>
        <ul className="flex flex-col gap-2">
          <li><Link to="/groups/ai-research" className="text-sm hover:underline"># AI Research</Link></li>
          <li><Link to="/groups/web-dev" className="text-sm hover:underline"># Web Dev 2024</Link></li>
          <li><Link to="/groups/ml-experts" className="text-sm hover:underline"># ML Experts</Link></li>
        </ul>
      </div>
    </aside>
  );
}
