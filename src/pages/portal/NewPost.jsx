import React, { useState } from 'react';
import TipTapEditor from '../../components/portal/components/TipTapEditor.jsx';
import ThumbnailUploader from '../../components/portal/components/ThumbnailUploader.jsx';
import { useProfileContext } from '../../context/ProfileContext.jsx';
import api from '../../api/apis.js';
import { toast } from 'react-toastify'; // Consider adding toast notifications
import 'react-toastify/dist/ReactToastify.css';

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
        // Alternatively, you could reload the page:
        // window.location.reload();
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
    <form onSubmit={handleSubmit} className="ltr text-left p-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Create New Post</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-2xl font-medium mb-3">Thumbnail Image</label>
        <ThumbnailUploader 
          onImageUpload={handleThumbnailUpload} 
          currentImage={thumbnail}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="title" className="block text-2xl font-medium mb-3">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          id="title"
          name="title"
          className="w-full rtl font-jameel-noori p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-xl"
          placeholder="Enter post title"
        />
      </div>

      <div className="mb-6">
        <h1 className='text-2xl mb-3 font-medium'>Select News Category</h1>
        <select 
          name="category" 
          required 
          value={category} 
          onChange={handleSelect} 
          id="category" 
          className='w-full p-3 text-xl border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
        >
          <option value=''>Select a category</option>
          <option value='pakistan-news'>Pakistan News</option>
          <option value='international-news'>International News</option>
          <option value='sports-news'>Sports News</option>
          <option value='business-news'>Business News</option>
          <option value='health-news'>Health News</option>
          <option value='science-news'>Science News</option>
        </select>
        {!category && <p className="mt-1 text-sm text-red-600">Please select a category</p>}
      </div>

      <div className="mb-8">
        <label htmlFor="content" className="block text-2xl font-medium mb-3">Content</label>
        <TipTapEditor value={content} onChange={handleContentChange} />
      </div>

      <div className="flex justify-end">
        <button
          disabled={loading}
          type="submit"
          className={`px-6 py-3 rounded-lg text-xl font-medium text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Post...
            </span>
          ) : 'Create Post'}
        </button>
      </div>
    </form>
  );
};

export default NewPost;