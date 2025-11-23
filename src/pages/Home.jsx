import { useState, useEffect, React } from "react";
import NewsSection from "../components/NewsSection";
import LatestNewsSidebar from "../components/LatestNewsSidebar";
import api from "../api/apis";

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);

  useEffect(() => {
    const getPosts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/getpost');
        setNews(response.data.posts);
      } catch (err) {
        console.error('posts request fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, []);

  const filterNews = (Type) => {
    const filteredNews = news.filter((item) => item.category.includes(Type));
    return filteredNews;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <NewsSection
                news={news}
                category={'latest-news'}
                loading={loading}
                section_name="اہم ترین خبریں"
              />
            </section>

            <section>
              <NewsSection
                news={filterNews('pakistan-news')}
                loading={loading}
                section_name="پاکستان"
                category="pakistan-news"
              />
            </section>

            <section>
              <NewsSection
                news={filterNews('international-news')}
                loading={loading}
                section_name="دنیا"
                category="international-news"
              />
            </section>

            <section>
              <NewsSection
                news={filterNews('sports-news')}
                loading={loading}
                section_name="کھیل"
                category="sports-news"
              />
            </section>

            <section>
              <NewsSection
                news={filterNews('business-news')}
                loading={loading}
                section_name="کاروبار"
                category="business-news"
              />
            </section>

            <section>
              <NewsSection
                news={filterNews('health-news')}
                loading={loading}
                section_name="صحت"
                category="health-news"
              />
            </section>

            <section>
              <NewsSection
                news={filterNews('science-news')}
                loading={loading}
                section_name="سائنس"
                category="science-news"
              />
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 relative">
            <LatestNewsSidebar latestNews={news} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
