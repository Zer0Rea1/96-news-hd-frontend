import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useProfileContext } from '../context/ProfileContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { profile, isLoading: profileLoading } = useProfileContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Skip payment check for membership page itself
  const isMembershipPage = location.pathname === '/portal/membership';
  
  useEffect(() => {
    // Check if user needs to pay but allow access to the membership page
    if (!isLoading && !profileLoading && isAuthenticated && profile) {
      if (profile.paid == 'unpaid'  && !isMembershipPage) {
        navigate('/portal/membership');
      }
      
    }

    
  }, [isAuthenticated, profile, profileLoading, isLoading, navigate, isMembershipPage]);

  if (isLoading || profileLoading) {
    // Show loading spinner or skeleton while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if(profile.paid == "pending"){
        return (
          <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-green-500 text-2xl mb-4">✓</div>
          <h2 className="text-xl font-bold mb-4">Payment Pending</h2>
          <p className="mb-6">
            Your payment application is in pending. Please wait 2-3 hours for us to review your application.
          </p>
          <p className="text-gray-500 text-sm">
            you can contect the admin on whatsapp : 03138687435
          </p>
        </div>
      </div>
        )
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" replace />;
  }
  
  // Allow access to membership page even if not paid
  if (!profile?.paid && !isMembershipPage) {
    return <Navigate to="/portal/membership" replace />;
  }

  return children;
}

export function CheckAdmin({ children }){
  const { isAuthenticated, isLoading } = useAuthContext();
  const { profile, isLoading: profileLoading } = useProfileContext();
  const location = useLocation();
  const navigate = useNavigate();


  // Skip admin check for login page
  const isLoginPage = location.pathname === '/auth/login';

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && !profileLoading && isAuthenticated && profile) {
      if ((!profile.role || profile.role !== "admin") && profile.role == "admin") {
        navigate('/portal/dashboard');
      }
    }
  }, [isAuthenticated, profile, profileLoading, isLoading, navigate]);

  
  if (isLoading || profileLoading) {
    // Show loading spinner or skeleton while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" replace />;
  }
  if (!profile?.role || profile.role !== "admin") {
    // Redirect non-admin users to dashboard
    return <Navigate to="/portal/dashboard" replace />;
  }

  return children;


}
