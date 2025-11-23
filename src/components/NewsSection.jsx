import { React } from "react";
import { Link } from "react-router-dom";

const NewsSection = ({ loading, news, section_name, category }) => {
  return (
    <>
      <div className="flex items-center mb-6 border-r-4 border-red-600 pr-4">
        <h2 className="font-jameel-noori text-3xl text-gray-800 font-bold">
          {section_name}
        </h2>
        <div className="flex-grow h-px bg-gray-200 mr-4"></div>
      </div>

      {loading ? (
        <NewsSectionSkeleton />
      ) : (
        <div className="space-y-6">
          {news.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-sm hover:shadow-xl rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group"
            >
              <Link to={`/news/${item._id}`} className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                  <img
                    loading="lazy"
                    src={item.thumbnailImage}
                    alt={item.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 md:w-2/3 flex flex-col justify-center">
                  <h3 className="font-jameel-noori text-2xl font-bold text-gray-800 mb-3 group-hover:text-red-600 transition-colors leading-relaxed">
                    {item.title}
                  </h3>
                  <p
                    className="font-jameel-noori text-lg text-gray-600 leading-loose line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: item.article.substring(0, 150) + "..."
                    }}
                  />
                  <div className="mt-4 flex items-center text-sm text-gray-400 font-jameel-noori">
                    <span>مزید پڑھیں</span>
                    <i className="fa-solid fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          to={`/page/${category}`}
          className="inline-block font-jameel-noori text-xl text-red-600 border-2 border-red-600 px-8 py-2 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300"
        >
          مزید خبریں دیکھیں
        </Link>
      </div>
    </>
  );
};

const NewsSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white shadow-sm rounded-xl p-4 flex flex-col md:flex-row gap-4 animate-pulse">
          <div className="md:w-1/3 h-48 bg-gray-200 rounded-lg"></div>
          <div className="md:w-2/3 space-y-4 py-2">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsSection;