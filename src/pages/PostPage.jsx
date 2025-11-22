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
        <span className="normal-font inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">
          {post.post.category}
        </span>
        <p className="normal-font text-sm text-gray-500">{post.authorname}</p>
        <button
          className=" border-2 m-2 p-2 rounded-xl text-center hover:bg-gray-100"
          onClick={() => {
            navigator.clipboard.writeText(`https://96-news-hd-backend.netlify.app/post/${post.post._id}`);
            alert('Post Link is copied to clipboard!');
          }}
        >
          Share
        </button>
        <hr className="my-5" />
        <div
          className="text-base sm:text-lg font-jameel-noori leading-8 sm:leading-10"
          dangerouslySetInnerHTML={{ __html: post.post.article }}
        ></div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <LatestNewsSidebar latestNews={latestNews} loading={loading} />
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
