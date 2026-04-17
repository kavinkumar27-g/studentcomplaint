/**
 * AuthContext.jsx
 * 
 * This file creates a global "Auth Context" that stores the currently 
 * logged-in user's information (token, name, role, etc.) and makes it 
 * accessible anywhere in the app without passing props manually.
 * 
 * Pattern: React Context + useReducer/useState
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create the context object (like a global storage)
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app.
 * It reads the JWT token from localStorage on startup to restore session.
 */
export function AuthProvider({ children }) {
  // User state: null when logged out, object when logged in
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app startup, check if there's a saved session in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Decode the JWT to check if it's expired
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Convert to seconds
        
        if (decoded.exp > currentTime) {
          // Token is still valid, restore the user session
          setUser(JSON.parse(userData));
        } else {
          // Token expired, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // Invalid token, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * login() - Called after successful API login
   * Saves token + user info to localStorage and updates state
   */
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * logout() - Clears everything and logs the user out
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // The value object shared across all components
  const value = {
    user,       // { id, name, email, role }
    login,      // function to login
    logout,     // function to logout
    isLoggedIn: !!user,
    isAdmin: user?.role === 'ADMIN',
    isStudent: user?.role === 'STUDENT',
    loading,    // true while checking localStorage on startup
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth() - Custom hook to access auth context in any component
 * Usage: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
