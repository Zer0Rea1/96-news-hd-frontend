import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

const PortalLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#F2E2D2] font-sans">
      {/* Header */}
      <header className="bg-[#4681C9] text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portal</h1>
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
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-[#4681C9] w-64 p-4 transform transition-transform duration-200 ease-in-out ${
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
                <Link to="/portal/posts" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Posts
                </Link>
              </li>
              <li>
                <Link to="/portal/users" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Users
                </Link>
              </li>
              <li>
                <Link to="/portal/settings" className="block p-2 hover:bg-[#9FB7B9] rounded text-white">
                  Settings
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-[#F2E2D2] p-4">
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