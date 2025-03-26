import { React, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NewsSection from "../components/NewsSection";

import {getPost} from '../api/postblog.api.js'
const NewsPage = () => {
  const [News, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();

  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Start loading
        const response = await fetch('https://dummyjson.com/posts'); // Wait for the API response
        const data = await response.json();
       
        setNews(data); // Update the state with fetched data
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      } finally {
        setLoading(false); // Stop loading regardless of success or error
      }
    };
  
    fetchData();
  }, [slug]);
  

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
    <div className="container mx-auto py-8 px-4 ">
      <div className="font-jameel-noori text-[25px] mb-4 border-r-4 border-red-600 h-12 pr-4">
        {routesTranslation[slug] || "خبر نہیں ملی"}
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 md:grid-cols-3 gap-2">
        {loading ? (
          <CardSkeleton />
        ) : News.length > 0 ? (
          News.map((item, index) => (
            <Link
              to="/post"
              key={index}
              className="news-card shadow-2xl p-2 rounded"
            >
              <img
                className="rounded w-full h-auto object-cover"
                src={item.image}
                alt=""
              />
              <div className="title font-jameel-noori m-4">{item.title}</div>
            </Link>
          ))
        ) : (
          <div className="ltr">No news found for this category.</div>
        )}
      </div>
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
