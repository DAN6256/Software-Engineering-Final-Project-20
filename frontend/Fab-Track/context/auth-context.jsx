"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Create authentication context
const AuthContext = createContext();

// Provider component to wrap app and manage auth state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Safe JSON parsing with error handling
  const safeJsonParse = (text) => {
    try {
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  };

  // Check if a token exists and validates if it is first load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const text = await response.text();
        const data = safeJsonParse(text);
        
        if (response.ok && data) {
          setUser(data);
        } else {
          // Fallback to basic user if /me endpoint fails
          setUser({ role: 'Student' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login method to authenticate user and store token
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      const data = safeJsonParse(text);

      if (!response.ok || !data) {
        throw new Error(data?.message || 'Login failed');
      }
      // Store token
      localStorage.setItem('authToken', data.token);
      
      // Create user object with fallbacks
      const userData = {
        email: email,
        role: 'Student',
        ...(data.userID && { id: data.userID }),
        ...(data.name && { name: data.name })
      };
      
      setUser(userData);
      return userData;
    } catch (error) {
      localStorage.removeItem('authToken');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
// Logout method to clear session and redirect to login
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    router.push('/login');
  };

  // Bundle context values to be accessible throughout the app
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };

  // Provide context to child components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
// Custom hook for easier access to auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}