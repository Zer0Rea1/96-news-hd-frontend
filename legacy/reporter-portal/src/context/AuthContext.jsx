import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import api from '../api/apis';

const AuthContext = createContext(null); // Avoid exporting directly

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuthStatus = useCallback(() => {
    return api.get('/api/auth/check-cookie').then(response => {
      const authenticated = response.status === 200 || response.status === 201;
      setIsAuthenticated(authenticated);
      if (authenticated && window.location.pathname === '/auth/login') {
        navigate('/portal');
      } else if (!authenticated && window.location.pathname.startsWith('/portal')) {
        navigate('/auth/login');
      }
    }).catch(() => {
      setIsAuthenticated(false);
      if (window.location.pathname.startsWith('/portal')) navigate('/auth/login');
    }).finally(() => setIsLoading(false));
  }, [navigate]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Export everything consistently
export { AuthProvider, useAuthContext, AuthContext };
