import { React, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import brand from '../assets/96news.jpg';
import { Menu, X, ChevronLeft, Home, Globe, TrendingUp, Activity, Briefcase, Heart, FlaskConical } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = () => {
    navigate(`/search`);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { route: '/page/latest-news', name: 'تازہ ترین', type: 'link', icon: TrendingUp },
    { route: '/page/pakistan-news', name: 'پاکستان', type: 'link', icon: Home },
    { route: '/page/international-news', name: 'دنیا', type: 'link', icon: Globe },
    { route: '/page/sports-news', name: 'کھیل', type: 'link', icon: Activity },
    { route: '/page/business-news', name: 'کاروبار', type: 'link', icon: Briefcase },
    { route: '/page/health-news', name: 'صحت', type: 'link', icon: Heart },
    { route: '/page/science-news', name: 'سائنس', type: 'link', icon: FlaskConical },
  ];

  return (
    <header className="bg-red-700 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 border-b-4 border-red-900">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center relative">

          {/* Mobile Menu Button (Left) */}
          <button
            className="md:hidden p-2 hover:bg-red-800 rounded-lg transition-colors active:scale-95 transform duration-200"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-7 h-7" />
          </button>

          {/* Brand Logo (Center on Mobile, Left on Desktop) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={brand}
                alt="96 News HD"
                className="h-10 md:h-14 w-auto rounded-lg shadow-md transform group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Search Icon (Right) */}
          <div className="flex items-center md:hidden">
            <button
              className="p-2 hover:bg-red-800 rounded-lg transition-colors active:scale-95 transform duration-200"
              onClick={handleSearch}
            >
              <i className="fa-solid fa-magnifying-glass text-xl"></i>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 ">
            <button
              className="p-2 cursor-pointer rounded-full hover:bg-red-800 transition-colors duration-300 mr-2"
              onClick={handleSearch}
            >
              <i className="fa-solid fa-magnifying-glass text-xl"></i>
            </button>

            <ul className="flex items-center gap-1">
              {navItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.route}
                    className="font-jameel-noori text-xl lg:text-2xl px-3 py-2 rounded-lg hover:bg-white hover:text-red-700 transition-all duration-300 block whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white text-gray-800 z-[60] transform transition-transform duration-300 ease-out shadow-2xl md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="ltr p-6 bg-red-700 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <img src={brand} alt="Logo" className="h-10 w-auto rounded-md border-2 border-white/20" />
              <span className="font-bold text-xl tracking-wider">96 NEWS HD</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-red-600 rounded-full transition-colors active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1  py-4 px-3 bg-gray-50 ">
            <ul className="space-y-2">
              {navItems.map((item, index) => {
                return (
                  <li key={index}>
                    <Link
                      to={item.route}
                      className="group flex items-center justify-between p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-red-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                      <div className="flex items-center gap-4 ">
                        <span className="font-jameel-noori text-xl font-medium text-black group-hover:text-red-700 transition-colors">
                          {item.name}
                        </span>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                          <div className="w-5 h-5 bg-red-200 rounded-full"></div>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 bg-white border-t border-gray-100">
            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 p-3 rounded-xl font-medium hover:bg-red-100 transition-colors mb-4"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>تلاش کریں</span>
            </button>
            <p className="text-center text-gray-400 text-sm font-jameel-noori ltr">
              © 2024 96 News HD. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;