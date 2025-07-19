import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { encryptData, decryptData, isValidToken } from '../utils/authUtils';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('auth_token');
    return stored && isValidToken(stored) ? stored : null;
  });
  
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      const decrypted = decryptData(stored);
      return decrypted && decrypted.role ? decrypted : null;
    }
    return null;
  });

  // Security: Auto-logout on token expiration
  useEffect(() => {
    if (!token) return;
    
    const checkTokenExpiry = () => {
      if (!isValidToken(token)) {
        logout();
      }
    };
    
    const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [token]);

  const login = useCallback((newToken, userData) => {
    
    if (!isValidToken(newToken)) {
      throw new Error('Invalid token provided');
    }
    
    if (!userData || !userData.role) {
      console.error('Invalid user data:', userData);
      throw new Error('Invalid user data provided');
    }
    
    setToken(newToken);
    setUser(userData);
    
    // Force immediate localStorage update
    localStorage.setItem('auth_token', newToken);
    const encrypted = encryptData(userData);
    if (encrypted) {
      localStorage.setItem('auth_user', encrypted);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('supplier_invitations'); // Clean up invitation data
  }, []);

  // Performance: Memoize computed values
  const isAdmin = useMemo(() => user && user.role === 'admin', [user]);
  const isSupplier = useMemo(() => user && user.role === 'supplier', [user]);
  const isClient = useMemo(() => user && user.role === 'client', [user]);
  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  // Security: Expose minimal user data
  const safeUser = useMemo(() => {
    if (!user) return null;
    
    // Only expose necessary user data
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      // Add other safe fields as needed
    };
  }, [user]);

  // Security: Secure storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      const encrypted = encryptData(user);
      if (encrypted) {
        localStorage.setItem('auth_user', encrypted);
      } else {
        console.error('Failed to encrypt user data');
      }
    } else {
      localStorage.removeItem('auth_user');
    }
  }, [user]);

  const value = {
    token,
    user: safeUser,
    isAdmin,
    isSupplier,
    isClient,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 