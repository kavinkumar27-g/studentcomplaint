/**
 * TopHeader.jsx
 * Fixed top header bar with search and action icons
 */
import { useState } from 'react';

function TopHeader({ title, subtitle, searchValue, onSearchChange, showSearch = true }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="top-header">
      {/* Page title area */}
      <div>
        <div className="header-title">{title}</div>
        {subtitle && <div className="header-subtitle">{subtitle}</div>}
      </div>

      {/* Search */}
      {showSearch && (
        <div className="header-search">
          <span className="header-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search complaints..."
            className="header-search-input"
            value={searchValue || ''}
            onChange={e => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="header-spacer" />

      {/* Action icons */}
      <div className="header-actions">
        <button
          className="header-icon-btn"
          onClick={() => setNotifOpen(!notifOpen)}
          title="Notifications"
        >
          🔔
          <span className="notif-badge">3</span>
        </button>
        <button className="header-icon-btn" title="Help">
          ❓
        </button>
      </div>
    </header>
  );
}

export default TopHeader;
