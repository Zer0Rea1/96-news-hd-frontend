import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Home, Globe, TrendingUp, Activity, Briefcase, Heart, FlaskConical } from 'lucide-react';
import brand from '../assets/96news.jpg';

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Lock Body Scroll when menu is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleSearch = () => {
    setIsOpen(false);
    navigate('/search');
  };

  const navItems = [
    { route: '/page/latest-news', name: 'تازہ ترین', icon: TrendingUp },
    { route: '/page/pakistan-news', name: 'پاکستان', icon: Home },
    { route: '/page/international-news', name: 'دنیا', icon: Globe },
    { route: '/page/sports-news', name: 'کھیل', icon: Activity },
    { route: '/page/business-news', name: 'کاروبار', icon: Briefcase },
    { route: '/page/health-news', name: 'صحت', icon: Heart },
    { route: '/page/science-news', name: 'سائنس', icon: FlaskConical },
  ];

  return (
    <>
      {/* --- MAIN HEADER BAR --- */}
      <header className="sticky top-0 z-40 w-full bg-red-700 text-white shadow-lg border-b-4 border-red-900">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          {/* Left: Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-red-800 transition-colors focus:outline-none"
            aria-label="Open Menu"
          >
            <Menu className="w-7 h-7" />
          </button>

          {/* Center: Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="block">
              <img
                src={brand}
                alt="96 News HD"
                className="h-10 md:h-12 w-auto rounded-md shadow-sm"
              />
            </Link>
          </div>

          {/* Right: Desktop Nav & Search */}
          <div className="flex items-center gap-2">
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.route}
                  className="font-jameel-noori px-3 py-2 text-lg hover:bg-white/10 rounded-md transition-colors whitespace-nowrap"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="p-2 rounded-full hover:bg-red-800 transition-colors"
            >
              <Search className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- MOBILE SIDEBAR OVERLAY & DRAWER --- */}

      {/* 1. The Dark Backdrop (Only visible when open) */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. The Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">

          {/* Header inside Sidebar */}
          <div className="flex items-center justify-between p-4 bg-red-700 text-white border-b-4 border-red-900">
            {/* <span className="normal-font text-lg tracking-wider ltr ">96 NEWS HD</span> */}
            <div className="flex-shrink-0">
              <Link to="/" className="block">
                <img
                  src={brand}
                  alt="96 News HD"
                  className="h-10 md:h-12 w-auto rounded-md shadow-sm"
                />
              </Link>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Link Area */}
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx}>
                    <Link
                      to={item.route}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-end gap-4 p-3 rounded-lg hover:bg-red-50 text-gray-800 group transition-colors border-b border-gray-100"
                    >
                      <span className="font-jameel-noori text-xl font-medium group-hover:text-red-700">
                        {item.name}
                      </span>
                      {/* Icon Container */}
                      <div className="p-2 bg-gray-100 rounded-full group-hover:bg-red-100 text-gray-500 group-hover:text-red-700 transition-colors">
                        <Icon size={18} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer Area */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 bg-red-700 text-white py-3 rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              <Search size={18} />
              <span className="font-jameel-noori text-lg">تلاش کریں</span>
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">
              © 2024 96 News HD
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Header;