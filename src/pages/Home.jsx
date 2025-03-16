import {useState,useEffect,React} from "react";
import NewsSection from "../components/NewsSection";
import LatestNewsSidebar from "../components/LatestNewsSidebar";

const Home = () => {
  const [Loading, setLoading] = useState(true)
  const [News, setNews] = useState([])
  useEffect(() => {
    fetch('https://dummyjson.com/posts')
.then(res => res.json())
.then(data => {setNews(data.posts);setLoading(false)});
  
    
  }, [])
  

  const filterNews = (news = news, Type) => {
    const filteredNews = news.filter((item) => item.newsType.includes(Type))
    return filteredNews;
  }
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <section className="mb-8">
            
            <NewsSection news={News} loading={Loading} section_name="اہم ترین خبریں"/>
            
            
          </section>
          <section className="mb-8">
            <h2 className="font-jameel-noori text-3xl mb-6 border-r-4 border-red-600 h-12 pr-4">
            سیاسی خبریں
            </h2>
            {/* <NewsSection index={1} title="this is title" image='https://urdu.arynews.tv/wp-content/uploads/2024/09/ganda1-1-696x342.jpg' article="this is article" /> */}
            {/* <NewsSection index={2} title="this is title" image='https://urdu.arynews.tv/wp-content/uploads/2024/09/ganda1-1-696x342.jpg' article="this is article" /> */}
          </section>
          <section className="mb-8">
            <h2 className="font-jameel-noori text-3xl mb-6 border-r-4 border-red-600 h-12 pr-4">
            کھیل
            </h2>
            {/* <NewsSection index={1} title="this is title" image='https://urdu.arynews.tv/wp-content/uploads/2024/09/ganda1-1-696x342.jpg' article="this is article" /> */}
            {/* <NewsSection index={2} title="this is title" image='https://urdu.arynews.tv/wp-content/uploads/2024/09/ganda1-1-696x342.jpg' article="this is article" /> */}
          </section>
        </div>
        <div className="md:col-span-1">
        <LatestNewsSidebar latestNews={News} loading={Loading} />
        </div>
      </div>
    </div>
  );
};


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

export default Home;
