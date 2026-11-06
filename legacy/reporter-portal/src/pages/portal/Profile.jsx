import React, { useState } from 'react';
import { useProfileContext } from '../../context/ProfileContext';
import EditProfile from '../../components/portal/components/EditProfile';
import { User, Mail, Phone, Calendar, MapPin, CreditCard, Clock } from 'lucide-react';
import { formatDate } from '../../utils/dateFormater';

const Profile = () => {
  const { profile, isLoading, error } = useProfileContext();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 text-xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header / Banner */}
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute -bottom-16 left-8">
              <img
                src={profile.avatar || "https://via.placeholder.com/150"}
                alt={profile.username}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-lg"
              />
            </div>
            <div className="absolute bottom-4 right-8">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full backdrop-blur-sm transition-all border border-white/40 font-medium"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">@{profile.username}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${profile.paid === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                  {profile.paid === 'paid' ? 'Premium Member' : 'Free Member'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span>{profile.city}</span>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 dark:border-gray-700">
                  Personal Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>Born {formatDate(profile.dateOfBirth)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                  {profile.expiresAt && (
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      <span>Membership expires {formatDate(profile.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && <EditProfile onClose={() => setIsEditing(false)} />}
    </div>
  );
};

export default Profile;