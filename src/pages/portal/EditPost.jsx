import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/apis';
import TipTapEditor from '../../components/portal/components/TipTapEditor';
import ThumbnailUploader from '../../components/portal/components/ThumbnailUploader';
import { toast } from 'react-toastify';
import { Image, Type, Tag, FileText, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const EditPost = () => {
  const [data, setData] = useState({
    title: '',
    category: '',
    thumbnailImage: null
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const { slug } = useParams();
  const navigate = useNavigate();

  const handleThumbnailUpload = (image) => {
    setData(prev => ({ ...prev, thumbnailImage: image }));
  };

  const handleContentChange = (value) => {
    setContent(value);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/getpostbyid/${slug}`);
        const post = response.data.post;
        setData({
          _id: post._id,
          title: post.title,
          category: post.category,
          thumbnailImage: post.thumbnailImage
        });
        setContent(post.article);
        setLoading(false);
      } catch (error) {
        console.error("Something went wrong", error);
        toast.error("Failed to load post data");
        setLoading(false);
      }
    };
    getData();
  }, [slug]);

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

    setSubmitting(true);
    try {
      const response = await api.put(`/api/posts/${data._id}`, {
        title: data.title,
        article: content,
        thumbnailImage: data.thumbnailImage,
        category: data.category
      });

      if (response.status === 200) {
        toast.success("Post updated successfully!");
        navigate('/portal/posts');
      } else {
        toast.error("Oops! Failed to update post, try again");
      }
    } catch {
      toast.error("Something went wrong with the server");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link to="/portal/posts" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Post</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Update your content.</p>
        </div>
      </div>

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
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium placeholder-gray-400"
                placeholder="Enter post title"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <FileText className="w-4 h-4" />
                Content
              </label>
              <div className="prose-editor">
                <TipTapEditor
                  value={content}
                  onChange={handleContentChange}
                  initialContent={data.article} // Pass initial content if needed by editor
                />
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
                initialThumbnail={data.thumbnailImage}
                currentImage={data.thumbnailImage}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <select
                value={data.category}
                onChange={(e) => setData({ ...data, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-no-repeat bg-right"
              >
                <option value="">Select a category</option>
                <option value="pakistan-news">Pakistan News</option>
                <option value="international-news">International News</option>
                <option value="sports-news">Sports News</option>
                <option value="business-news">Business News</option>
                <option value="health-news">Health News</option>
                <option value="science-news">Science News</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 ${submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'
                }`}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
