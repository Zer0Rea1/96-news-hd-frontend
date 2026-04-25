import React, { useState, useEffect } from "react";
import LivePlayer from "../components/LivePlayer";
import LatestNewsSidebar from "../components/LatestNewsSidebar";
import api from "../api/apis";

const Live = () => {
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

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto py-8 md:py-12 px-4 md:px-6 max-w-4xl">
                <div className="space-y-12">
                    {/* Main Player Area */}
                    <section>
                        <LivePlayer />
                    </section>

                    {/* Latest News Area */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                        <LatestNewsSidebar latestNews={news.slice(0, 10)} loading={loading} />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Live;
