import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/apis';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/profile');
        
        setUserData(response.data);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  if (loading) return <ProfileSkeleton />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-gray-600">Username</label>
              <p className="text-xl font-semibold">{userData?.profile.username}</p>
            </div>
            
            <div>
              <label className="text-gray-600">Email</label>
              <p className="text-xl">{userData?.profile.email}</p>
            </div>

            <div>
              <label className="text-gray-600">Role</label>
              <p className="text-xl capitalize">{userData?.profile.role || 'User'}</p>
            </div>
            <div>
              <label className="text-gray-600">Paid</label>
              <p className="text-xl">{userData?.profile.paid}</p>
            </div>
            <div>
              <label className="text-gray-600">Member Since</label>
              <p className="text-xl">
                {new Date(userData?.profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-gray-600">Membership Expires At</label>
              <p className="text-xl">
                {new Date(userData?.profile.expiresAt).toLocaleDateString()}
              </p>
            </div>
          
          </div>

          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={userData?.profile.avatar || 'httpps://cdn.vectorstock.com/i/500p/08/19/gray-photo-placeholder-icon-design-ui-vector-35850819.jpg'}
                alt="Profile"
                className="rounded-full w-32 h-32 object-cover"
              />
            </div>
            
            <button
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={() => {/* Add edit profile handler */}}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 