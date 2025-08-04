import React from 'react';
import { Link } from 'react-router-dom';
import brand from '../assets/96news.jpg';

const Header = () => {
  // Array of navigation items
  const navItems = [
    { route: '/page/latest-news', name: 'تازہ ترین', type: 'link' },
    { route: '/page/pakistan-news', name: 'پاکستان', type: 'link' },
    { route: '/page/international-news', name: 'دنیا', type: 'link' },
    { route: '/page/sports-news', name: 'کھیل', type: 'link' },
    { route: '/page/business-news', name: 'کاروبار', type: 'link' },
    { route: '/page/health-news', name: 'صحت', type: 'link' },
    { route: '/page/science-news', name: 'سائنس', type: 'link' },
  ];

  // Function to toggle the search bar
  const toggleSearchBar = (e) => {
    const searchInput = document.querySelector('.search-input');
    searchInput.classList.toggle('hidden');
    searchInput.focus();
  };

  return (
    <header className="bg-red-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="text-3xl font-bold font-jameel-noori mb-4 md:mb-0">
          <img src={brand} alt="96 News HD" className="h-12" />
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex flex-wrap justify-center space-x-2 md:space-x-4 items-center">
            {/* Search Icon */}
            <li className="p-3 cursor-pointer" onClick={toggleSearchBar}>
              <i className="fa-solid fa-magnifying-glass text-xl hover:text-red-300 transition-colors duration-300"></i>
            </li>

            {/* Search Input */}
            <input
              type="text"
              className="search-input rtl hidden bg-red-400 border-2 border-red-700 rounded-lg px-4 py-2 text-white placeholder-gray-200 focus:outline-none focus:border-red-900 transition-all duration-300"
              placeholder="...Search"
            />

            {/* Dynamically Render Navigation Items */}
            {navItems.map((item, index) => (
              <li key={index}>
                {item.type === 'link' ? (
                  <Link
                    to={item.route}
                    className="font-jameel-noori text-2xl hover:bg-red-700 px-3 py-2 rounded"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <button className="font-jameel-noori font-bold text-lg hover:bg-red-700 px-3 py-2 rounded">
                    {item.name}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;