import React, { useState } from 'react';
import TipTapEditor from '../../components/portal/components/TipTapEditor.jsx';
import ThumbnailUploader from '../../components/portal/components/ThumbnailUploader.jsx';
import { useProfileContext } from '../../context/ProfileContext.jsx';
import api from '../../api/apis.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Image, Type, Tag, FileText, Send } from 'lucide-react';

const NewPost = () => {
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { profile } = useProfileContext();

  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleThumbnailUpload = (image) => {
    setThumbnail(image);
  };

  const handleSelect = (event) => {
    setCategory(event.target.value);
  };

  const resetForm = () => {
    setContent('');
    setThumbnail(null);
    setCategory('');
    setTitle('');
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!category) {
        throw new Error('Please select a category');
      }

      const response = await api.post('/api/newpost', {
        title: title,
        article: content,
        thumbnailImage: thumbnail,
        category: category,
        authorid: profile.userId
      });

      if (response.status === 201) {
        toast.success('Post created successfully!');
        resetForm();
      } else {
        throw new Error('There was a problem creating your post');
      }
    } catch (err) {
      console.error('Post creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create post');
      toast.error(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Post</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Share your thoughts with the world.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <Type className="w-4 h-4" />
                Post Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium placeholder-gray-400"
                placeholder="Enter an engaging title..."
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <FileText className="w-4 h-4" />
                Content
              </label>
              <div className="prose-editor">
                <TipTapEditor value={content} onChange={handleContentChange} />
              </div>
            </div>
          </div>

          {/* Right Column - Meta & Settings */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <Image className="w-4 h-4" />
                Thumbnail
              </label>
              <ThumbnailUploader
                onImageUpload={handleThumbnailUpload}
                currentImage={thumbnail}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                required
                value={category}
                onChange={handleSelect}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-right"
              >
                <option value=''>Select a category</option>
                <option value='pakistan-news'>Pakistan News</option>
                <option value='international-news'>International News</option>
                <option value='sports-news'>Sports News</option>
                <option value='business-news'>Business News</option>
                <option value='health-news'>Health News</option>
                <option value='science-news'>Science News</option>
              </select>
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Publish Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewPost;