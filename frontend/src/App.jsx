/**
 * App.jsx
 * 
 * Root component that defines all application routes.
 * 
 * Route Structure:
 *  /           → Redirect to login (or dashboard if logged in)
 *  /login      → Login page (public)
 *  /register   → Register page (public)
 *  /student    → Student Dashboard (protected: STUDENT role only)
 *  /admin      → Admin Dashboard (protected: ADMIN role only)
 *  *           → 404 Not Found
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';

/**
 * RootRedirect - Redirects '/' to the appropriate page based on auth state.
 * Logged-in admin → /admin
 * Logged-in student → /student
 * Not logged in → /login
 */
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-dark" style={{ width: '32px', height: '32px' }}></div>
        <p style={{ color: '#4a5568', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return <Navigate to="/student" replace />;
}

/**
 * NotFoundPage - Shown when navigating to an unknown route
 */
function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem',
      background: '#f4f6f9',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: '#cc0000', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 36, marginBottom: '0.5rem',
        boxShadow: '0 8px 24px rgba(204,0,0,0.25)',
      }}>🔍</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#cc0000', lineHeight: 1 }}>404</h1>
      <p style={{ fontSize: '1.125rem', color: '#4a5568', textAlign: 'center' }}>
        Page not found. The route you're looking for doesn't exist.
      </p>
      <a href="/login" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '12px 24px', background: '#cc0000', color: 'white',
        borderRadius: 8, textDecoration: 'none', fontWeight: 600,
        fontSize: '0.9375rem', marginTop: '0.5rem',
        boxShadow: '0 4px 12px rgba(204,0,0,0.3)',
      }}>
        ← Back to Login
      </a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root: smart redirect based on auth state */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes: no auth required */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected: Student Dashboard (STUDENT role only) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected: Admin Dashboard (ADMIN role only) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
