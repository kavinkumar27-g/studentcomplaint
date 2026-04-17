/**
 * Sidebar.jsx
 * Main sidebar navigation - HSBC-inspired red/white theme
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// SVG Icons
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  complaints: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  newComplaint: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  activity: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  tracker: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
};

function Sidebar({ activeTab, onTabChange, pendingCount }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  // Nav items for STUDENT
  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'complaints', label: 'My Complaints', icon: Icons.complaints, badge: pendingCount },
    { id: 'new', label: 'New Complaint', icon: Icons.newComplaint },
    { id: 'tracker', label: 'Track Status', icon: Icons.tracker },
  ];

  // Nav items for ADMIN
  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
    { id: 'all', label: 'All Complaints', icon: Icons.complaints, badge: pendingCount },
    { id: 'users', label: 'Students', icon: Icons.users },
    { id: 'activity', label: 'Activity Log', icon: Icons.activity },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNav : studentNav;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/student')}>
        <div className="sidebar-logo-icon">🎓</div>
        <div>
          <div className="sidebar-logo-text">ComplainEase</div>
          <span className="sidebar-logo-sub">Student Portal</span>
        </div>
      </div>

      {/* User card */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{getInitials(user?.name)}</div>
        <div>
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">
            <span className="role-dot"></span>
            {user?.role}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
            {item.badge > 0 && (
              <span className="sidebar-nav-badge">{item.badge}</span>
            )}
          </button>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '8px' }}>Account</div>
        <button className="sidebar-nav-item" onClick={() => onTabChange('settings')}>
          <span className="sidebar-nav-icon">{Icons.settings}</span>
          Settings
        </button>
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-nav-item" style={{ color: '#ef4444', width: '100%' }} onClick={handleLogout}>
          <span className="sidebar-nav-icon">{Icons.logout}</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
