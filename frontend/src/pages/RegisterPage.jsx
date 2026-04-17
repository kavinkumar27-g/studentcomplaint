/**
 * RegisterPage.jsx - HSBC-inspired Red/White Theme
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT',
  });
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
    if (!formData.name.trim()) errs.name = 'Full name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Min. 6 characters';
    if (!formData.confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });
      showToast('Account created! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root" id="register-page">
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
          <div className="auth-left-title">Join the Portal<br />Today</div>
          <p className="auth-left-subtitle">
            Register as a student to submit and track your complaints efficiently.
          </p>
          <div className="auth-features" style={{ marginTop: '2rem' }}>
            {[
              { icon: '✅', text: 'Free to register and use' },
              { icon: '📨', text: 'Submit complaints instantly' },
              { icon: '📊', text: 'View complaint status anytime' },
              { icon: '🛡️', text: 'Private and secure data' },
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
        <div className="auth-form-card" style={{ maxWidth: '480px' }}>
          <div className="auth-form-title">Create Account</div>
          <p className="auth-form-subtitle">Join the complaint management portal</p>

          <form onSubmit={handleSubmit} noValidate id="register-form">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name" type="text" name="name"
                value={formData.name} onChange={handleChange}
                className="form-input" placeholder="John Smith"
                autoComplete="name" disabled={loading}
              />
              {errors.name && <span className="form-error">⚠ {errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email" type="email" name="email"
                value={formData.email} onChange={handleChange}
                className="form-input" placeholder="you@example.com"
                autoComplete="email" disabled={loading}
              />
              {errors.email && <span className="form-error">⚠ {errors.email}</span>}
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Register As</label>
              <select
                id="reg-role" name="role"
                value={formData.role} onChange={handleChange}
                className="form-select" disabled={loading}
              >
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff Member</option>
              </select>
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Admin accounts are created by system administrators only.
              </small>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password} onChange={handleChange}
                  className="form-input" placeholder="Min. 6 characters"
                  autoComplete="new-password" disabled={loading}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button" onClick={() => setShowPass(!showPass)}
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

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
              <input
                id="reg-confirm-password" type="password" name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange}
                className="form-input" placeholder="Re-enter your password"
                autoComplete="new-password" disabled={loading}
              />
              {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
            </div>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? <><div className="spinner"></div> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <p style={{
            textAlign: 'center', marginTop: '1.25rem',
            fontSize: '0.9rem', color: 'var(--text-muted)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--red-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
