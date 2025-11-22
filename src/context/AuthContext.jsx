import { createContext, useContext, useState, useEffect } from "react";
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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // console.log('Authentication state:', isAuthenticated);
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/auth/check-cookie');

      if (response.status === 200 || response.status === 201) {
        // console.log('Auth check successful');
        setIsAuthenticated(true);
        if (window.location.pathname === '/auth/login') {
          navigate('/portal');
        }
      } else {
        // console.log('Auth check failed');
        setIsAuthenticated(false);
        if (window.location.pathname.startsWith('/portal')) {
          navigate('/auth/login');
        }
      }
    } catch (error) {
      // console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      if (window.location.pathname.startsWith('/portal')) {
        navigate('/auth/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
