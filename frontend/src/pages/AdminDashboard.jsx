/**
 * AdminDashboard.jsx - Full redesign with HSBC-inspired sidebar layout
 */
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STATUS_OPTIONS = [
  { value: 'PENDING',     label: '⏳ Pending' },
  { value: 'IN_PROGRESS', label: '🔄 In Progress' },
  { value: 'RESOLVED',    label: '✅ Resolved' },
];

const CATEGORIES = [
  { value: 'HOSTEL',    label: 'Hostel' },
  { value: 'ACADEMIC',  label: 'Academic' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'IT_SUPPORT',label: 'IT Support' },
  { value: 'OTHERS',    label: 'Others' },
];

function StatusBadge({ status }) {
  const MAP = {
    PENDING:     { label: 'Pending',     cls: 'badge-pending' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-progress' },
    RESOLVED:    { label: 'Resolved',    cls: 'badge-resolved' },
  };
  const cfg = MAP[status] || { label: status, cls: '' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---- Admin Overview Tab ----
function AdminOverview({ complaints, onTabChange, loading }) {
  const stats = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === 'PENDING').length,
    inProgress: complaints.filter(c => c.status === 'IN_PROGRESS').length,
    resolved:   complaints.filter(c => c.status === 'RESOLVED').length,
  };

  const recent = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <>
      <div className="stats-row">
        <div className="stat-card stat-card-total">
          <div className="stat-card-icon stat-icon-total">📊</div>
          <div className="stat-card-info">
            <div className="stat-card-label">Total Complaints</div>
            <div className="stat-card-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card stat-card-open">
          <div className="stat-card-icon stat-icon-open">📬</div>
          <div className="stat-card-info">
            <div className="stat-card-label">Open Complaints</div>
            <div className="stat-card-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
          </div>
        </div>
        <div className="stat-card stat-card-resolved">
          <div className="stat-card-icon stat-icon-resolved">✅</div>
          <div className="stat-card-info">
            <div className="stat-card-label">Resolved</div>
            <div className="stat-card-value" style={{ color: '#10b981' }}>{stats.resolved}</div>
          </div>
        </div>
        <div className="stat-card stat-card-pending">
          <div className="stat-card-icon stat-icon-pending">🔄</div>
          <div className="stat-card-info">
            <div className="stat-card-label">Pending Complaints</div>
            <div className="stat-card-value" style={{ color: '#ef4444' }}>{stats.inProgress}</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">🕐</div>
            Recent Activity
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => onTabChange('all')}>
            View All →
          </button>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner spinner-dark" style={{ margin: '0 auto 1rem', width: '24px', height: '24px' }}></div>
            Loading...
          </div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📭</div>
            <div className="empty-state-title">No complaints yet</div>
            <p className="empty-state-desc">Students haven't submitted any complaints yet.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>C.ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Date Received</th>
                  <th>Complaint Summary</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c, i) => (
                  <tr key={c.id}>
                    <td className="td-id">{String(i + 1).padStart(2, '0')}</td>
                    <td className="td-primary">{c.user?.name || '—'}</td>
                    <td className="td-email">{c.user?.email || '—'}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                    <td>
                      <div style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {c.title}
                      </div>
                    </td>
                    <td><span className="cat-tag">{c.category?.replace('_', ' ')}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ---- All Complaints Tab ----
function AllComplaintsTab({ complaints, loading, onRefresh, onStatusUpdate, onDelete, updatingId, deletingId }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    const mQ = !q || c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.user?.name?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q);
    const mS = !filterStatus || c.status === filterStatus;
    const mC = !filterCat || c.category === filterCat;
    return mQ && mS && mC;
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">📋</div>
            All Complaints
            <span style={{
              background: 'var(--red-primary)', color: 'white',
              borderRadius: '20px', padding: '2px 8px',
              fontSize: '0.75rem', fontWeight: 700,
            }}>{filtered.length}</span>
          </div>
          <button id="admin-refresh-btn" className="btn btn-outline btn-sm" onClick={onRefresh} disabled={loading}>
            {loading ? <div className="spinner spinner-dark"></div> : '🔄 Refresh'}
          </button>
        </div>

        <div style={{ padding: '1rem 1.5rem' }}>
          <div className="filters-bar">
            <div className="filter-group" style={{ flex: 2, minWidth: 220 }}>
              <span className="filter-search-icon">🔍</span>
              <input
                id="admin-search"
                type="text" className="filter-input"
                placeholder="Search by title, student, email..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select id="admin-filter-status" className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select id="admin-filter-category" className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {(search || filterStatus || filterCat) && (
              <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterCat(''); }}>
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="spinner spinner-dark" style={{ margin: '0 auto 1rem', width: '24px', height: '24px' }}></div>
            Loading all complaints...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">{complaints.length === 0 ? '📭' : '🔍'}</div>
            <div className="empty-state-title">
              {complaints.length === 0 ? 'No complaints yet' : 'No matching results'}
            </div>
            <p className="empty-state-desc">
              {complaints.length === 0 ? 'Students will appear here once they submit complaints.' : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>C.ID</th>
                  <th>Complaint Details</th>
                  <th>Student</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Update Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="td-id">{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ maxWidth: 240 }}>
                      <div className="td-primary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.description}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.user?.name || '—'}</div>
                      <div className="td-email">{c.user?.email || '—'}</div>
                    </td>
                    <td><span className="cat-tag">{c.category?.replace('_', ' ')}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {updatingId === c.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div className="spinner spinner-dark"></div>
                          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Updating…</span>
                        </div>
                      ) : (
                        <select
                          id={`status-select-${c.id}`}
                          className="status-select"
                          value={c.status}
                          onChange={e => onStatusUpdate(c.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(c.createdAt)}
                    </td>
                    <td>
                      {deletingId === c.id ? (
                        <div className="spinner spinner-dark"></div>
                      ) : (
                        <button
                          id={`delete-btn-${c.id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => setConfirmDelete(c.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1rem' }}>⚠️</div>
            <div className="modal-title">Confirm Delete</div>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              Are you sure you want to permanently delete this complaint? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button id="confirm-delete-btn" className="btn btn-danger" onClick={() => onDelete(confirmDelete)}>
                🗑️ Yes, Delete
              </button>
              <button id="cancel-delete-btn" className="btn btn-outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---- Students Tab ----
function StudentsTab({ complaints }) {
  // Derive unique students from complaints
  const students = Object.values(
    complaints.reduce((acc, c) => {
      if (c.user?.id && !acc[c.user.id]) {
        acc[c.user.id] = {
          ...c.user,
          total: 0, pending: 0, resolved: 0,
        };
      }
      if (c.user?.id) {
        acc[c.user.id].total++;
        if (c.status === 'PENDING') acc[c.user.id].pending++;
        if (c.status === 'RESOLVED') acc[c.user.id].resolved++;
      }
      return acc;
    }, {})
  );

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">👥</div>
          Students ({students.length})
        </div>
      </div>
      {students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">👥</div>
          <div className="empty-state-title">No students yet</div>
          <p className="empty-state-desc">Students will appear here once they submit complaints.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Total</th>
                <th>Pending</th>
                <th>Resolved</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id}>
                  <td className="td-id">{String(i + 1).padStart(2, '0')}</td>
                  <td className="td-primary">{s.name}</td>
                  <td className="td-email">{s.email}</td>
                  <td style={{ fontWeight: 700 }}>{s.total}</td>
                  <td><span className="badge badge-pending">{s.pending}</span></td>
                  <td><span className="badge badge-resolved">{s.resolved}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- Activity Log Tab ----
function ActivityLogTab({ complaints }) {
  const activity = [...complaints]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 20);

  const formatFull = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">📊</div>
          Activity Log
        </div>
      </div>
      {activity.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-emoji">📊</div>
          <div className="empty-state-title">No activity yet</div>
          <p className="empty-state-desc">Activity will appear once complaints are submitted or updated.</p>
        </div>
      ) : (
        <div style={{ padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {activity.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                paddingBottom: i < activity.length - 1 ? '1rem' : 0,
                borderLeft: i < activity.length - 1 ? '2px solid var(--border)' : '2px solid transparent',
                marginLeft: '12px', paddingLeft: '1.25rem', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: -9, top: 0,
                  width: 16, height: 16, borderRadius: '50%',
                  background: c.status === 'RESOLVED' ? '#10b981' : c.status === 'IN_PROGRESS' ? '#6366f1' : 'var(--red-primary)',
                  border: '2px solid white',
                  boxShadow: '0 0 0 2px var(--border)',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {c.user?.name} • {c.category?.replace('_', ' ')} • {' '}
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Updated: {formatFull(c.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Admin Settings Tab ----
function AdminSettingsTab({ user }) {
  const { showToast } = useToast();
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">⚙️</div>
          Admin Settings
        </div>
      </div>
      <div className="card-body">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          marginBottom: '1.5rem', padding: '1rem',
          background: 'var(--red-soft)', borderRadius: '10px',
          border: '1px solid rgba(204,0,0,0.1)',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--red-primary), #ff4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AD'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            <span className="badge badge-resolved" style={{ marginTop: '4px' }}>ADMINISTRATOR</span>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" defaultValue={user?.name} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input type="email" className="form-input" defaultValue={user?.email} readOnly />
        </div>
        <div className="form-group">
          <label className="form-label">Role</label>
          <input type="text" className="form-input" defaultValue="ADMIN" readOnly />
        </div>
        <button className="btn btn-outline" onClick={() => showToast('Profile update coming soon!', 'info')}>
          ✏️ Edit Profile
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Main Admin Dashboard Component
// ============================================================
function AdminDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/complaints');
      setComplaints(res.data);
    } catch {
      showToast('Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await api.put(`/api/complaints/${id}/status`, { status: newStatus });
      setComplaints(prev => prev.map(c =>
        c.id === id ? { ...c, status: res.data.status, updatedAt: res.data.updatedAt } : c
      ));
      showToast(`Status updated to "${newStatus.replace('_', ' ')}"`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/api/complaints/${id}`);
      setComplaints(prev => prev.filter(c => c.id !== id));
      showToast('Complaint deleted successfully.', 'success');
    } catch {
      showToast('Failed to delete complaint.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = complaints.filter(c => c.status === 'PENDING').length;

  const tabTitles = {
    dashboard: 'Admin Dashboard',
    all:       'All Complaints',
    users:     'Students',
    activity:  'Activity Log',
    settings:  'Settings',
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
      />

      <div className="main-content">
        <TopHeader
          title={tabTitles[activeTab] || 'Dashboard'}
          subtitle={`Admin: ${user?.name}`}
          showSearch={activeTab === 'all'}
          searchValue=""
          onSearchChange={() => {}}
        />

        <div className="page-content">
          {activeTab === 'dashboard' && (
            <AdminOverview complaints={complaints} onTabChange={setActiveTab} loading={loading} />
          )}
          {activeTab === 'all' && (
            <AllComplaintsTab
              complaints={complaints}
              loading={loading}
              onRefresh={fetchComplaints}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
              updatingId={updatingId}
              deletingId={deletingId}
            />
          )}
          {activeTab === 'users' && <StudentsTab complaints={complaints} />}
          {activeTab === 'activity' && <ActivityLogTab complaints={complaints} />}
          {activeTab === 'settings' && <AdminSettingsTab user={user} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
