import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/apis"; // adjust if needed

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await api.get(`/api/search?query=${query}`);
      setResults(response.data.results || []); // adapt to your API structure
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Search blog..."
          className="normal-font ltr w-full border px-4 py-2 rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="normal-font font-normal bg-red-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading results...</p>
      ) : results.length > 0 ? (
        <ul className="space-y-4">
          {results.map((post) => (
            <li key={post._id} className="p-4 bg-white shadow rounded">
              <Link to={`/news/${post._id}`} className="text-xl font-bold text-red-700">
                {post.title}
              </Link>
              <p className="text-sm text-gray-600">{post.category}</p>
            </li>
          ))}
        </ul>
      ) : (
        query && <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchPage;
