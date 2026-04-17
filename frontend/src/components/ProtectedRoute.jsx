/**
 * ProtectedRoute.jsx
 * 
 * A wrapper component that protects routes from unauthorized access.
 * 
 * If user is NOT logged in → redirect to /login
 * If user's role doesn't match → redirect to their dashboard
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component
 * @param {React.ReactNode} children - The page to render if authorized
 * @param {string[]} roles - Allowed roles (e.g., ['ADMIN'] or ['STUDENT', 'ADMIN'])
 */
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // Show nothing while checking localStorage on startup
  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-dark" style={{ width: '32px', height: '32px' }}></div>
        <p style={{ color: '#4a5568', fontFamily: 'Inter, sans-serif' }}>Loading...</p>
      </div>
    );
  }

  // Not logged in → go to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check: if roles are specified, verify the user has one of them
  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate dashboard based on their actual role
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  // All checks passed → render the protected page
  return children;
}

export default ProtectedRoute;
