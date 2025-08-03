import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useProfileContext } from '../context/ProfileContext';

const PortalLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { profile, isLoading } = useProfileContext();

  // Avatar placeholder image
  const defaultAvatar = 'https://cdn.vectorstock.com/i/500p/08/19/gray-photo-placeholder-icon-design-ui-vector-35850819.jpg';

  return (
    <div className="min-h-screen flex flex-col bg-[#F2E2D2] font-sans">
      {/* Header */}
      <header className="bg-[#4681C9] text-white  p-4 flex justify-between items-center">
        <h1 className="text-2xl hidden md:block font-bold">Portal</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>
        
        {/* User Avatar */}
        <Link 
          to="/portal/profile" 
          className="flex items-center space-x-2"
        >
          <span className="hidden md:inline text-sm mr-2">
            {profile?.username || 'User'}
          </span>
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white flex items-center justify-center bg-gray-200">
            {isLoading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse"></div>
            ) : (
              <img 
                src={profile?.avatar || defaultAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
              />
            )}
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-[#4681C9] w-64 p-4 md:h-auto h-full fixed md:static z-10 transform transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
        >
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to="/portal/dashboard" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/portal/new-post" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  New Post
                </Link>
              </li>
              <li>
                <Link to="/portal/posts" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Posts
                </Link>
              </li>
              {(profile.role == "admin")&&<li>
                <Link to="/portal/users" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Users
                </Link>
                <Link to="/admin/paymentverify" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  payment verify
                </Link>
              </li>
              }
              
              <li>
                {/* <Link to="/portal/settings" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Settings
                </Link> */}
              </li>
              <li>
                <Link to="/portal/profile" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Profile
                </Link>
              </li>
            </ul>
            <Link to="/auth/logout" className='bg-red-500 p-2 rounded-2xl my-4 mx-2'>Logout</Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className={`bg-[#F2E2D2] p-4 transition-all duration-200 ${
          isSidebarOpen ? 'md:ml-0 flex-1' : 'w-full'
        }`}>
          <Outlet />
        </main>
      </div>

      {/* Floating Add Button */}
      <button className="fixed bottom-4 right-4 bg-[#8400C6] text-white p-4 rounded-full shadow-lg hover:bg-[#6A00A3] transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
};

export default PortalLayout;