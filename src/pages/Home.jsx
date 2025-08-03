import {useState,useEffect,React} from "react";
import NewsSection from "../components/NewsSection";
import LatestNewsSidebar from "../components/LatestNewsSidebar";
import api from "../api/apis";
const Home = () => {
  const [Loading, setLoading] = useState(true)
  const [News, setNews] = useState([])
  useEffect(() => {
     const getPosts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/getpost');
                setNews(response.data);
            } catch (err) {
                console.error('posts request fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        getPosts()
  }, [])
  

  const filterNews = (Type) => {
    const filteredNews = News.filter((item) => item.category.includes(Type))
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
            
            <NewsSection news={filterNews('pakistan-news')} loading={Loading} section_name="پاکستان"/>
          
          </section>
          <section className="mb-8">
            <NewsSection news={filterNews('international-news')} loading={Loading} section_name="دنیا"/>

          </section>
          <section className="mb-8">
            <NewsSection news={filterNews('sports-news')} loading={Loading} section_name="کھیل"/>

          </section>
          <section className="mb-8">
            <NewsSection news={filterNews('business-news')} loading={Loading} section_name="کاروبار"/>

          </section>
          <section className="mb-8">
            <NewsSection news={filterNews('health-news')} loading={Loading} section_name="صحت"/>

          </section>
          <section className="mb-8">
            <NewsSection news={filterNews('science-news')} loading={Loading} section_name="سائنس"/>

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
