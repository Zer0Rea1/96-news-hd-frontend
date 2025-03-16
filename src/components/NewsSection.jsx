import React from "react";
import { Link } from "react-router-dom";
const NewsSection = ({loading,news,section_name}) => {
  return (
    <>
        <h2 className="font-jameel-noori text-3xl mb-6 border-r-4 border-red-600 h-12 pr-4">
            {section_name}
        </h2>
        {loading ? <NewsSectionSkeleton /> : news.slice(0,3).map((item,index)=>(
              
              <div
        key={index}
        className="bg-gray-100 shadow-md rounded-lg p-4 mb-4 hover:shadow-lg transition-shadow duration-300"
        >
        <Link to={`/post/`}>
            <img
            loading="lazy"
            src="https://urdu.arynews.tv/wp-content/uploads/2024/09/ganda1-1-696x342.jpg"
            alt=""
            className="w-full h-auto object-cover rounded-lg"
            />
            <h3 className="font-jameel-noori text-[20px] mt-2 mb-4">
            {item.title}
            </h3>
            <p className="font-jameel-noori text-[15px] leading-[2.5rem]">
            {item.body.substring(0, 150) || item.body}...
            </p>
        </Link>
        </div>

        ))}
        
    </>
  );
};



export default NewsSection;


const NewsSectionSkeleton = () => {
    return (
      <>
        <section className="mb-8 bg-white">
          {/* <h2 className="bg-gray-300 animate-pulse h-12 rounded mb-6 pr-4"></h2> */}
  
          <div className="bg-gray-200 animate-pulse shadow-md rounded-lg p-4 mb-4">
            <div className="bg-gray-300 animate-pulse w-full h-48 rounded-lg"></div>
            <h3 className="bg-gray-300 animate-pulse h-6 mt-2 mb-4 rounded"></h3>
            <p className="bg-gray-300 animate-pulse h-12 leading-[2.5rem] rounded"></p>
          </div>
  
          <div className="bg-gray-200 animate-pulse shadow-md rounded-lg p-4 mb-4">
            <div className="bg-gray-300 animate-pulse w-full h-48 rounded-lg"></div>
            <h3 className="bg-gray-300 animate-pulse h-6 mt-2 mb-4 rounded"></h3>
            <p className="bg-gray-300 animate-pulse h-12 leading-[2.5rem] rounded"></p>
          </div>
  
          {/* <Link className="bg-gray-300 animate-pulse h-8 w-full text-center block text-red-500 underline text-xl rounded"></Link> */}
        </section>
      </>
    );
  };