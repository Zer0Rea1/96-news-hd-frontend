import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useProfileContext } from '../context/ProfileContext';
import api from '../api/apis';
import { toast } from 'react-toastify';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const PortalLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile, isLoading } = useProfileContext();
  const location = useLocation();
  const navigate = useNavigate();

  const defaultAvatar = 'https://cdn.vectorstock.com/i/500p/08/19/gray-photo-placeholder-icon-design-ui-vector-35850819.jpg';

  const handleLogout = async () => {
    try {
      const response = await api.post('/api/auth/logout');
      if (response.status === 200) {
        toast.success('Logged out successfully!');
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <li>
        <Link
          to={to}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
        >
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
          <span className="font-medium">{label}</span>
          {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
        </Link>
      </li>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex font-sans">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 shadow-xl md:shadow-none flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              96
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">NewsHD</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Menu</div>

          <ul className="space-y-1">
            <NavItem to="/portal/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/portal/posts" icon={FileText} label="Posts" />
            <NavItem to="/portal/new-post" icon={PlusCircle} label="New Post" />
          </ul>

          {profile?.role === 'admin' && (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-4">Admin</div>
              <ul className="space-y-1">
                <NavItem to="/admin/users" icon={Users} label="Users" />
                <NavItem to="/admin/paymentverify" icon={CreditCard} label="Payment Verify" />
              </ul>
            </>
          )}

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-4 px-4">Account</div>
          <ul className="space-y-1">
            <NavItem to="/portal/profile" icon={Settings} label="Profile" />
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm">
              <img
                src={profile?.avatar || defaultAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile?.firstName} {profile?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{profile?.username}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 dark:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-gray-900 dark:text-white">Portal</span>
          <div className="w-6" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;