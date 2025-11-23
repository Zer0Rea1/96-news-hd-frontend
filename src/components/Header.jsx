import { React, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import brand from '../assets/96news.jpg';

const Header = () => {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate(`/search`);
  };

  const navItems = [
    { route: '/page/latest-news', name: 'تازہ ترین', type: 'link' },
    { route: '/page/pakistan-news', name: 'پاکستان', type: 'link' },
    { route: '/page/international-news', name: 'دنیا', type: 'link' },
    { route: '/page/sports-news', name: 'کھیل', type: 'link' },
    { route: '/page/business-news', name: 'کاروبار', type: 'link' },
    { route: '/page/health-news', name: 'صحت', type: 'link' },
    { route: '/page/science-news', name: 'سائنس', type: 'link' },
  ];

  return (
    <header className="bg-red-700 text-white shadow-lg sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 border-b-4 border-red-900">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={brand}
            alt="96 News HD"
            className="h-14 w-auto rounded-lg shadow-md transform group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Navigation */}
        <nav className="mt-4 md:mt-0 w-full md:w-auto">
          <ul className="flex flex-wrap justify-center md:justify-end items-center gap-2 md:gap-1">
            {/* Search Icon */}
            <li className="p-2 cursor-pointer rounded-full hover:bg-red-800 transition-colors duration-300" onClick={handleSearch}>
              <i className="fa-solid fa-magnifying-glass text-xl"></i>
            </li>

            {/* Navigation Items */}
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.route}
                  className="font-jameel-noori text-xl md:text-2xl px-3 py-2 rounded-lg hover:bg-white hover:text-red-700 transition-all duration-300 block"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;