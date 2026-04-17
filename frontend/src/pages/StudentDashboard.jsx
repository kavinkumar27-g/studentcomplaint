/**
 * StudentDashboard.jsx - Full redesign with HSBC-inspired sidebar layout
 */
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import TopHeader from '../components/TopHeader';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  { value: 'HOSTEL', label: '🏠 Hostel' },
  { value: 'ACADEMIC', label: '📚 Academic' },
  { value: 'TRANSPORT', label: '🚌 Transport' },
  { value: 'IT_SUPPORT', label: '💻 IT Support' },
  { value: 'OTHERS', label: '📌 Others' },
];

const STATUS_CONFIG = {
  PENDING:     { label: 'Pending',     cls: 'badge-pending',  dot: '#f59e0b' },
  IN_PROGRESS: { label: 'In Progress', cls: 'badge-progress', dot: '#3b82f6' },
  RESOLVED:    { label: 'Resolved',    cls: 'badge-resolved', dot: '#10b981' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: '' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ---- Dashboard Overview Tab ----
function OverviewTab({ complaints, onTabChange, loading }) {
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
      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card stat-card-total">
          <div className="stat-card-icon stat-icon-total">📋</div>
          <div className="stat-card-info">
            <div className="stat-card-label">Total Complaints</div>
            <div className="stat-card-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat-card stat-card-open">
          <div className="stat-card-icon stat-icon-open">⏳</div>
          <div className="stat-card-info">
            <div className="stat-card-label">Pending</div>
            <div className="stat-card-value" style={{ color: '#f59e0b' }}>{stats.pending}</div>
          </div>
        </div>
        <div className="stat-card stat-card-progress">
          <div className="stat-card-icon stat-icon-progress">🔄</div>
          <div className="stat-card-info">
            <div className="stat-card-label">In Progress</div>
            <div className="stat-card-value" style={{ color: '#6366f1' }}>{stats.inProgress}</div>
          </div>
        </div>
        <div className="stat-card stat-card-resolved">
          <div className="stat-card-icon stat-icon-resolved">✅</div>
          <div className="stat-card-info">
            <div className="stat-card-label">Resolved</div>
            <div className="stat-card-value" style={{ color: '#10b981' }}>{stats.resolved}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => onTabChange('new')}>
          ➕ Submit New Complaint
        </button>
        <button className="btn btn-outline" onClick={() => onTabChange('complaints')}>
          📋 View All My Complaints
        </button>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">📋</div>
            Recent Activity
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => onTabChange('complaints')}>
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
            <p className="empty-state-desc">Submit your first complaint to get started.</p>
            <button className="btn btn-primary" onClick={() => onTabChange('new')}>
              ➕ Submit First Complaint
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c, i) => (
                  <tr key={c.id}>
                    <td className="td-id">{String(i + 1).padStart(2, '0')}</td>
                    <td>
                      <div className="td-primary">{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {c.description?.length > 60 ? c.description.slice(0, 60) + '…' : c.description}
                      </div>
                    </td>
                    <td><span className="cat-tag">{c.category?.replace('_', ' ')}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
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

// ---- Complaints List Tab ----
function ComplaintsTab({ complaints, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    const matchS = !filterStatus || c.status === filterStatus;
    const matchC = !filterCat || c.category === filterCat;
    return matchQ && matchS && matchC;
  });

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">📋</div>
            My Complaints
            <span style={{
              background: 'var(--red-primary)', color: 'white',
              borderRadius: '20px', padding: '2px 8px',
              fontSize: '0.75rem', fontWeight: 700,
            }}>{filtered.length}</span>
          </div>
          <button id="refresh-complaints-btn" className="btn btn-outline btn-sm" onClick={onRefresh} disabled={loading}>
            {loading ? <div className="spinner spinner-dark"></div> : '🔄 Refresh'}
          </button>
        </div>
        <div style={{ padding: '1rem 1.5rem' }}>
          <div className="filters-bar">
            <div className="filter-group" style={{ flex: 2, minWidth: 200 }}>
              <span className="filter-search-icon">🔍</span>
              <input
                type="text" className="filter-input"
                placeholder="Search by title or description..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select className="filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
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
            Loading complaints...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">{complaints.length === 0 ? '📭' : '🔍'}</div>
            <div className="empty-state-title">
              {complaints.length === 0 ? 'No complaints yet' : 'No results found'}
            </div>
            <p className="empty-state-desc">
              {complaints.length === 0
                ? 'You have not submitted any complaints yet.'
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>C.ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Date Submitted</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="td-id">{String(i + 1).padStart(2, '0')}</td>
                    <td>
                      <div className="td-primary">{c.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: 280 }}>
                        {c.description?.length > 70 ? c.description.slice(0, 70) + '…' : c.description}
                      </div>
                    </td>
                    <td><span className="cat-tag">{c.category?.replace('_', ' ')}</span></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(c.createdAt)}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{formatDate(c.updatedAt)}</td>
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

// ---- New Complaint Form Tab ----
function NewComplaintTab({ onSuccess }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ title: '', description: '', category: 'HOSTEL' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    else if (formData.title.trim().length < 5) errs.title = 'Min. 5 characters';
    if (!formData.description.trim()) errs.description = 'Description is required';
    else if (formData.description.trim().length < 20) errs.description = 'Please describe in at least 20 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('category', formData.category);
      await api.post('/api/complaints', payload);
      showToast('Complaint submitted successfully! 🎉', 'success');
      setFormData({ title: '', description: '', category: 'HOSTEL' });
      setErrors({});
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit. Please try again.';
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">✍️</div>
          Submit New Complaint
        </div>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate id="complaint-form">

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-title">Complaint Title *</label>
            <input
              id="complaint-title" type="text" name="title"
              value={formData.title} onChange={handleChange}
              className="form-input"
              placeholder="Brief, clear title for your complaint..."
              disabled={submitting}
            />
            {errors.title && <span className="form-error">⚠ {errors.title}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-category">Category *</label>
            <select
              id="complaint-category" name="category"
              value={formData.category} onChange={handleChange}
              className="form-select" disabled={submitting}
            >
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="complaint-description">Detailed Description *</label>
            <textarea
              id="complaint-description" name="description"
              value={formData.description} onChange={handleChange}
              className="form-textarea"
              placeholder="Describe your issue clearly. Include when it happened, how it affects you, and any steps already taken…"
              rows={6} disabled={submitting}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.description
                ? <span className="form-error">⚠ {errors.description}</span>
                : <span />
              }
              <span className="char-counter">{formData.description.length} chars</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <button
              id="submit-complaint-btn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ minWidth: '168px' }}
            >
              {submitting
                ? <><div className="spinner"></div> Submitting...</>
                : '🚀 Submit Complaint'
              }
            </button>
            <button
              type="button" className="btn btn-outline"
              disabled={submitting}
              onClick={() => { setFormData({ title: '', description: '', category: 'HOSTEL' }); setErrors({}); }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Tracker Tab ----
function TrackerTab({ complaints }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">📍</div>
          Complaint Tracker
        </div>
      </div>
      <div className="card-body">
        {complaints.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📍</div>
            <div className="empty-state-title">No complaints to track</div>
            <p className="empty-state-desc">Submit a complaint to start tracking its status.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[...complaints]
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .map(c => {
                const steps = [
                  { label: 'Submitted',    done: true },
                  { label: 'Under Review', done: c.status === 'IN_PROGRESS' || c.status === 'RESOLVED' },
                  { label: 'In Progress',  done: c.status === 'IN_PROGRESS' || c.status === 'RESOLVED' },
                  { label: 'Resolved',     done: c.status === 'RESOLVED' },
                ];
                return (
                  <div key={c.id} style={{
                    border: '1px solid var(--border)', borderRadius: '10px',
                    padding: '1.25rem', background: '#fafbfc',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{c.title}</div>
                        <span className="cat-tag">{c.category?.replace('_', ' ')}</span>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    {/* Progress Track */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
                      {steps.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: s.done ? 'var(--red-primary)' : '#e5e7eb',
                              color: s.done ? 'white' : 'var(--text-muted)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, transition: 'all 0.3s',
                              boxShadow: s.done ? '0 2px 8px rgba(204,0,0,0.3)' : 'none',
                            }}>
                              {s.done ? '✓' : i + 1}
                            </div>
                            <div style={{
                              fontSize: '0.6875rem', marginTop: 4,
                              color: s.done ? 'var(--red-primary)' : 'var(--text-muted)',
                              fontWeight: s.done ? 600 : 400, textAlign: 'center',
                            }}>
                              {s.label}
                            </div>
                          </div>
                          {i < steps.length - 1 && (
                            <div style={{
                              flex: 1, height: 3, borderRadius: 2,
                              background: steps[i + 1].done ? 'var(--red-primary)' : '#e5e7eb',
                              marginBottom: 20,
                              transition: 'background 0.3s',
                            }} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Last updated: {formatDate(c.updatedAt)}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Settings Tab ----
function SettingsTab({ user }) {
  const { showToast } = useToast();
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">⚙️</div>
          Account Settings
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
            {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            <span className="badge badge-pending" style={{ marginTop: '4px' }}>{user?.role}</span>
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
          <input type="text" className="form-input" defaultValue={user?.role} readOnly />
        </div>

        <button
          className="btn btn-outline"
          onClick={() => showToast('Profile update coming soon!', 'info')}
        >
          ✏️ Edit Profile
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Main Student Dashboard Component
// ============================================================
function StudentDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/complaints/my');
      setComplaints(res.data);
    } catch {
      showToast('Failed to load complaints.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const pendingCount = complaints.filter(c => c.status === 'PENDING').length;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch('');
  };

  const tabTitles = {
    dashboard:  'Dashboard',
    complaints: 'My Complaints',
    new:        'New Complaint',
    tracker:    'Track Status',
    settings:   'Settings',
  };

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={pendingCount}
      />

      <div className="main-content">
        <TopHeader
          title={tabTitles[activeTab] || 'Dashboard'}
          subtitle={`Welcome, ${user?.name}`}
          showSearch={activeTab === 'complaints'}
          searchValue={search}
          onSearchChange={setSearch}
        />

        <div className="page-content">
          {activeTab === 'dashboard' && (
            <OverviewTab complaints={complaints} onTabChange={handleTabChange} loading={loading} />
          )}
          {activeTab === 'complaints' && (
            <ComplaintsTab complaints={complaints} loading={loading} onRefresh={fetchComplaints} />
          )}
          {activeTab === 'new' && (
            <NewComplaintTab onSuccess={() => { fetchComplaints(); handleTabChange('complaints'); }} />
          )}
          {activeTab === 'tracker' && (
            <TrackerTab complaints={complaints} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab user={user} />
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
