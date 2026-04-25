import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LatestNewsSidebar from "../components/LatestNewsSidebar";
import api from "../api/apis";
import "../App.css";

const PostPage = () => {
  const { slug } = useParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [latestNews, setLatestNews] = useState([]);

  const getPost = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/api/getpostbyid/${slug}`);

      if (response.status === 200 && response.data?.post) {
        setPost(response.data);
      } else {
        setError("Unable to load post. Please refresh or try again later.");
      }
    } catch (err) {
      console.error("Post fetch error:", err);
      setError("An error occurred while fetching the post.");
    } finally {
      setLoading(false);
    }
  };

  const getLatestNews = async () => {
    try {
      const response = await api.get("/api/getpost");
      if (response.status === 200 && response.data?.posts) {
        setLatestNews(response.data.posts);
      }
    } catch (err) {
      console.error("Latest news fetch error:", err);
    }
  };

  useEffect(() => {
    getPost();
    getLatestNews();
  }, [slug]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-red-100 text-red-800 px-4 py-3 rounded-md max-w-lg text-center">
          {error}
        </div>
        <button
          onClick={getPost}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!post?.post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-gray-500">No post found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Post Content */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 lg:col-span-2">
        <img
          className="w-full max-h-[320px] object-cover rounded-lg"
          src={post.post.thumbnailImage}
          alt={post.post.title}
        />
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 mt-6 font-jameel-noori">
          {post.post.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between border-t border-b border-gray-100 py-4 my-6 gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">Published By</span>
                <span className="font-medium text-gray-800 text-sm">{post.authorname || "Admin"}</span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider font-semibold">Published On</span>
                <span className="text-sm text-gray-600 font-medium">
                  {post.post.dateandtime ? new Date(post.post.dateandtime).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "Unknown Date"}
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-gray-200"></div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100">
                {post.post.category.replace(/-/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg border border-gray-200 transition-all active:scale-95"
            onClick={() => {
              navigator.clipboard.writeText(`https://api.96newshd.com/post/${post.post._id}`);
              alert('Post Link is copied to clipboard!');
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-5.368m0 5.368a3 3 0 100-5.368m5.684 9.342a3 3 0 110-5.368m0 5.368a3 3 0 100-5.368m-5.684-9.342a3 3 0 110-5.368m0 5.368a3 3 0 100-5.368"></path>
            </svg>
            Share
          </button>
        </div>
        <div
          className="text-base sm:text-lg font-jameel-noori leading-8 sm:leading-10"
          dangerouslySetInnerHTML={{ __html: post.post.article }}
        ></div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <LatestNewsSidebar latestNews={latestNews.slice(0, 10)} loading={loading} />
      </div>
    </div>
  );
};

const LoadingSkeleton = () => {
  return (
    <div className="container mx-auto py-6 px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md lg:col-span-2">
        <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="mt-6 mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="lg:col-span-1">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 rounded-lg animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
