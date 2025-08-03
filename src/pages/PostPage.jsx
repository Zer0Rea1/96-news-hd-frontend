import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LatestNewsSidebar from "../components/LatestNewsSidebar";
import api from "../api/apis";
import '../App.css'
const PostPage = () => {
  const { slug } = useParams();

  const [Loading, setLoading] = useState(true);
  const [Post, setPost] = useState({});

  const getPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/getpostbyid/${slug}`);
      setPost(response.data);
    } catch (err) {
      console.error('posts request fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPost();
  }, []);

  if (Loading) {
    return <HtmlComponent />;
  }

  return (
    <div className="container mx-auto py-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white shadow-md rounded-lg p-6 md:col-span-2">
        <img className="max-h-[320px] max-w-720 rounded w-full h-full object-cover contain-content" src={Post.post.thumbnailImage} alt="" />
        <h1 className="text-3xl font-bold mb-6 mt-6 font-jameel-noori">
        {Post.post.title}
        </h1>
        <span className="normal-font inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">
                                    {Post.post.category}
                                </span>
        <p className="normal-font">{Post.authorname}</p>
        <hr className="my-5" />
        <p className="text-xl font-jameel-noori leading-10" dangerouslySetInnerHTML={{__html: Post.post.article}}></p>
      </div>
      {/* <div className="md:col-span-1">
          <LatestNewsSidebar latestNews={posts}  />
      </div> */}
      {/* <HtmlComponent/> */}
    </div>
  );
};

const HtmlComponent = () => {
  return (
    <>
      <div className="bg-white p-6 md:col-span-2 rounded-lg">
        <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="mt-6 mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </>
  );
};


export default PostPage;
