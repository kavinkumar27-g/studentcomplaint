/**
 * Navbar.jsx
 * 
 * Top navigation bar displayed on all authenticated pages.
 * Shows: Logo, user name+role, and a logout button.
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('You have been logged out successfully.', 'info');
    navigate('/login');
  };

  // Get user's initials for the avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar" id="main-navbar">
      {/* Brand / Logo */}
      <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate(user?.role === 'ADMIN' ? '/admin' : '/student')}>
        <div className="navbar-brand-icon">📋</div>
        <span className="navbar-brand-name">ComplainEase</span>
      </div>

      {/* User Info + Logout */}
      <div className="navbar-user">
        {user && (
          <>
            {/* User details */}
            <div className="navbar-user-info">
              <div className="navbar-user-name">{user.name}</div>
              <div className="navbar-user-role">{user.role}</div>
            </div>

            {/* Avatar circle with initials */}
            <div className="navbar-avatar" title={user.name}>
              {getInitials(user.name)}
            </div>
          </>
        )}

        {/* Logout Button */}
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          title="Logout"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
