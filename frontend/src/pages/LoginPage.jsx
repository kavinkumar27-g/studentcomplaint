/**
 * LoginPage.jsx - HSBC-inspired Red/White Theme
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Min. 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      const { token, id, name, email, role } = res.data;
      login(token, { id, name, email, role });
      showToast(`Welcome back, ${name}! 👋`, 'success');
      navigate(role === 'ADMIN' ? '/admin' : '/student');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid email or password.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" id="login-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-logo">
          <div className="auth-left-hexagon">🎓</div>
          <div>
            <div className="auth-left-brand">ComplainEase</div>
            <span className="auth-left-tagline">Student Complaint Portal</span>
          </div>
        </div>

        <div className="auth-left-content">
          <div className="auth-left-title">Manage Your<br />Complaints Easily</div>
          <p className="auth-left-subtitle">
            A fast, transparent complaint tracking system built for students and administrators.
          </p>

          <div className="auth-features">
            {[
              { icon: '📋', text: 'Submit & track complaints in real-time' },
              { icon: '🔔', text: 'Get notified on every status update' },
              { icon: '⚡', text: 'Fast resolution by dedicated admins' },
              { icon: '🔒', text: 'Secure JWT-based authentication' },
            ].map((f, i) => (
              <div className="auth-feature-item" key={i}>
                <div className="auth-feature-dot">{f.icon}</div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-card">
          <div className="auth-form-title">Welcome Back 👋</div>
          <p className="auth-form-subtitle">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} noValidate id="login-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
              {errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '16px', color: 'var(--text-muted)',
                  }}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="form-error">⚠ {errors.password}</span>}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? <><div className="spinner"></div> Signing In...</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="demo-hint" style={{ marginTop: '1.25rem' }}>
            <strong>🔑 Demo Credentials</strong><br />
            Admin: <code>admin@example.com</code> / <code>admin123</code><br />
            Student: register a new account below
          </div>

          <p style={{
            textAlign: 'center', marginTop: '1.25rem',
            fontSize: '0.9rem', color: 'var(--text-muted)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--red-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
