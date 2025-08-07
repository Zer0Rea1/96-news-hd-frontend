import { React, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/apis.js";
import NewsSection from "../components/NewsSection";
import { getPost } from "../api/postblog.api.js";

const NewsPage = () => {
  const [News, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // each page is 10 posts
  const [hasMore, setHasMore] = useState(true); // to hide load more
  const { slug } = useParams();

  const POSTS_PER_PAGE = 10;

  const fetchData = async (reset = false) => {
    try {
      setLoading(true);

      const skip = reset ? 0 : page * POSTS_PER_PAGE;

      const response = await api.get(
        `/api/getpost?skip=${skip}&limit=${POSTS_PER_PAGE}`
      );

      const allPosts = response.data.posts;
      const filteredNews =
        slug !== "latest-news"
          ? allPosts.filter((item) => item.category.includes(slug))
          : allPosts;

      if (reset) {
        setNews(filteredNews);
      } else {
        setNews((prev) => [...prev, ...filteredNews]);
      }

      const total = response.data.totalCount;
      const totalLoaded = (reset ? 0 : page * POSTS_PER_PAGE) + filteredNews.length;
      setHasMore(totalLoaded < total);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchData(true); // Reset on slug change
  }, [slug]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(); // next fetch adds more
  };

  const routesTranslation = {
    "latest-news": "تازہ ترین",
    "pakistan-news": "پاکستان",
    "international-news": "دنیا",
    "sports-news": "کھیل",
    "business-news": "کاروبار",
    "health-news": "صحت",
    "science-news": "سائنس",
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="font-jameel-noori text-[25px] mb-4 border-r-4 border-red-600 h-12 pr-4">
        {routesTranslation[slug] || "خبر نہیں ملی"}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        {loading && page === 0 ? (
          <CardSkeleton />
        ) : News.length > 0 ? (
          News.map((item, index) => (
            <Link
              to={`/news/${item._id}`}
              key={index}
              className="news-card shadow-2xl p-2 rounded"
            >
              <img
                className="rounded w-full h-auto object-cover"
                src={item.thumbnailImage}
                alt=""
              />
              <div className="title font-jameel-noori m-4">{item.title}</div>
            </Link>
          ))
        ) : (
          <div className="ltr">No news found for this category.</div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
};



const CardSkeleton = () => {
  return (
    <>
      <div className="bg-white p-2 rounded">
        <div className="animate-pulse">
          <div className="rounded w-full h-48 bg-gray-300"></div>
          <div className="title font-jameel-noori m-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      <div className="bg-white p-2 rounded">
        <div className="animate-pulse">
          <div className="rounded w-full h-48 bg-gray-300"></div>
          <div className="title font-jameel-noori m-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      <div className="bg-white p-2 rounded">
        <div className="animate-pulse">
          <div className="rounded w-full h-48 bg-gray-300"></div>
          <div className="title font-jameel-noori m-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      <div className="bg-white p-2 rounded">
        <div className="animate-pulse">
          <div className="rounded w-full h-48 bg-gray-300"></div>
          <div className="title font-jameel-noori m-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
      
    </>
  );
};


export default NewsPage;