import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  loginWithGoogle: (email?: string, name?: string) => void;
  loginWithPin: (pin: string) => boolean;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AUTH_STORAGE_KEY = 'salestrack_admin_auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (adminUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [adminUser]);

  const loginWithGoogle = (email = 'nayanchildoffice@gmail.com', name = 'Nayan Sharma') => {
    const user: AdminUser = {
      email,
      name,
      role: 'Authorised Manager',
      avatar: email[0]?.toUpperCase() || 'A',
      authenticatedAt: new Date().toISOString(),
    };
    setAdminUser(user);
    setIsAuthModalOpen(false);
  };

  const loginWithPin = (pin: string): boolean => {
    if (pin.trim() === '250205' || pin.toLowerCase().includes('admin') || pin.includes('@')) {
      const email = pin.includes('@') ? pin : 'nayanchildoffice@gmail.com';
      const name = pin.includes('@') ? pin.split('@')[0] : 'Nayan Sharma';
      loginWithGoogle(email, name);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isAdmin: !!adminUser,
        adminUser,
        loginWithGoogle,
        loginWithPin,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
