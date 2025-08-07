import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/apis';
import TipTapEditor from '../../components/portal/components/TipTapEditor';
import ThumbnailUploader from '../../components/portal/components/ThumbnailUploader';
import { toast } from 'react-toastify';

const EditPost = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // ✅ NEW
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const { slug } = useParams();

  const handleThumbnailUpload = (image) => {
    setThumbnail(image);
    setData(prev => ({ ...prev, thumbnailImage: image })); // ✅ Correct way
  };

  const handleContentChange = (value) => {
    setContent(value);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/getpostbyid/${slug}`);
        setData(response.data.post);
        setContent(response.data.post.article);
        setLoading(false);
      } catch (error) {
        console.log("Something went wrong", error);
      }
    };
    getData();
  }, [slug]);

  if (loading) return <div>Loading...</div>;

  const validateForm = () => {
    if (!data.title || data.title.trim() === '') {
      toast.error("Title is required");
      return false;
    }
    if (!data.category || data.category === '') {
      toast.error("Please select a category");
      return false;
    }
    if (!content || content.trim() === '') {
      toast.error("Content cannot be empty");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true); // ✅ Disable the button
    try {
      const response = await api.put(`/api/posts/${data._id}`, {
        title: data.title,
        article: content,
        thumbnailImage: thumbnail,
        category: data.category
      });

      if (response.status === 200) {
        toast.success("Post updated successfully!");
      } else {
        toast.error("Oops! Failed to update post, try again");
      }
    } catch {
      toast.error("Something went wrong with the server");
    } finally {
      setSubmitting(false); // ✅ Re-enable the button
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <label className="block text-2xl font-medium mb-3">Thumbnail Image</label>
        <ThumbnailUploader
          onImageUpload={handleThumbnailUpload}
          initialThumbnail={data.thumbnailImage}
        />
      </div>

      <input
        type="text"
        placeholder="Post Title"
        className="w-full mb-4 p-2 border rounded"
        value={data.title}
        onChange={(e) => setData({ ...data, title: e.target.value })}
      />

      <select
        value={data.category}
        onChange={(e) => setData({ ...data, category: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select a category</option>
        <option value="pakistan-news">Pakistan News</option>
        <option value="international-news">International News</option>
        <option value="sports-news">Sports News</option>
        <option value="business-news">Business News</option>
        <option value="health-news">Health News</option>
        <option value="science-news">Science News</option>
      </select>

      <TipTapEditor
        value={content}
        onChange={handleContentChange}
        initialContent={data.article}
      />

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={submitting} // ✅ Disable button during submission
        className={`mt-4 px-6 py-2 rounded text-white transition duration-200 
          ${submitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {submitting ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.372 0 0 5.372 0 12h4z"></path>
            </svg>
            Updating...
          </div>
        ) : (
          'Submit'
        )}
      </button>
    </div>
  );
};

export default EditPost;
