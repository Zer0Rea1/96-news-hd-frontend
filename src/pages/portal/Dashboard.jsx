import React, { useEffect, useState } from 'react';
import { useProfileContext } from '../../context/ProfileContext';
import { useAuthContext } from '../../context/AuthContext';
import api from '../../api/apis';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Activity,
  Plus,
  FileText,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const { profile } = useProfileContext();
  const { isAuthenticated } = useAuthContext();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/getPostByuser');
        setPosts(response.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      getPosts();
    }
  }, [isAuthenticated]);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className="text-green-500 font-medium flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {trend}
          </span>
          <span className="text-gray-400 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );

  // Get recent 3 posts
  const recentPosts = posts.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your content today.
          </p>
        </div>
        <Link
          to="/portal/new-post"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create New Post</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Posts"
          value={loading ? "..." : posts.length}
          icon={FileText}
          color="bg-purple-500"
          trend={null}
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Link to="/portal/posts" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading activity...</div>
            ) : recentPosts.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No recent activity.</div>
            ) : (
              recentPosts.map((post) => (
                <div key={post._id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{post.title}</h4>
                    <p className="text-sm text-gray-500 capitalize">{post.category.replace('-', ' ')}</p>
                  </div>
                  <span className="text-sm text-gray-400 whitespace-nowrap">
                    {new Date(post.dateandtime).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/portal/new-post" className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200">
              <Plus className="w-5 h-5" />
              Create Post
            </Link>
            <Link to="/portal/profile" className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200">
              <Users className="w-5 h-5" />
              Edit Profile
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;