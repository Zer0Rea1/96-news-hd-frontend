import { createContext, useContext, useState, useEffect } from "react";
import api from '../api/apis';
import { useAuthContext } from './AuthContext';

// Create the context
const ProfileContext = createContext(null);

// Custom hook for using the context
export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}

// Provider component
export function ProfileProvider({ children }) {
  const [profileState, setProfileState] = useState({
    profile: null,
    isLoading: true,
    error: null
  });
  
  const { isAuthenticated } = useAuthContext();

  // Fetch profile data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    } else {
      setProfileState({
        profile: null,
        isLoading: false,
        error: null
      });
    }
  }, [isAuthenticated]);

  // Function to fetch profile data
  const fetchProfileData = async () => {
    try {
      setProfileState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.get('/api/profile');
      
      if (response.status === 200) {
        setProfileState({
          profile: response.data.profile,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setProfileState({
        profile: null,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to load profile data'
      });
    }
  };

  // Function to update profile data
  const updateProfile = async (profileData) => {
    try {
      setProfileState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await api.put('/api/profile', profileData);
      
      if (response.status === 200) {
        setProfileState({
          profile: response.data.profile,
          isLoading: false,
          error: null
        });
        return { success: true };
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setProfileState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to update profile'
      }));
      return { success: false, error: error.response?.data?.message || 'Failed to update profile' };
    }
  };

  // Context value
  const value = {
    ...profileState,
    fetchProfileData,
    updateProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export { ProfileContext }; 