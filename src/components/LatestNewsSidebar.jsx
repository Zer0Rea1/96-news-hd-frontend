import React from 'react';
import { Link } from 'react-router-dom';

const LatestNewsSidebar = React.memo(({ latestNews, loading }) => {
  return (
    <div className="sticky top-24">
      <div className="flex items-center mb-6 border-r-4 border-red-600 pr-4">
        <h2 className="font-jameel-noori text-2xl font-bold text-gray-800">
          تازہ ترین خبریں
        </h2>
      </div>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="bg-red-600 h-1 w-full"></div>

        {loading ? (
          <SidebarSkeleton />
        ) : (
          <ul className="divide-y divide-gray-100">
            {latestNews.slice(0, 8).map((item, index) => (
              <li key={index} className="group hover:bg-red-50 transition-colors duration-200">
                <Link
                  to={`/news/${item._id}`}
                  reloadDocument
                  className="block p-4"
                >
                  <div className="flex gap-3">
                    <span className="font-bold text-red-200 text-xl group-hover:text-red-600 transition-colors">
                      {index + 1}.
                    </span>
                    <h3 className="font-jameel-noori text-lg text-gray-700 group-hover:text-red-700 leading-relaxed transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

const SidebarSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-6 h-6 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LatestNewsSidebar;
