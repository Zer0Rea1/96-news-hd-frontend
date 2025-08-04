import { useState } from 'react';
import api from '../api/apis';
import ThumbnailUploader from './ThumbnailUploader'; // Your image upload component

const EditPostForm = ({ post, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: post.title,
    article: post.article,
    thumbnailImage: null, // For new image uploads
    category: post.category
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(post.thumbnailImage);

  // Handle text/select inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (file) => {
    if (file) {
      setFormData(prev => ({ ...prev, thumbnailImage: file }));
      setPreviewImage(URL.createObjectURL(file)); // Create preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('article', formData.article);
      formDataToSend.append('category', formData.category);
      
      // Only append image if a new one was uploaded
      if (formData.thumbnailImage) {
        formDataToSend.append('thumbnailImage', formData.thumbnailImage);
      }

      const response = await api.put(`/api/posts/${post._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUpdate(response.data.post); // Notify parent
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Edit Post</h2>
      
      {/* Title Field */}
      <div className="mb-4">
        <label htmlFor="title" className="block mb-2 font-medium">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Thumbnail Image</label>
        <div className="flex items-center space-x-4">
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Current thumbnail" 
              className="w-24 h-24 object-cover rounded"
            />
          )}
          <ThumbnailUploader onImageUpload={handleImageUpload} />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {formData.thumbnailImage ? 'New image selected' : 'Leave empty to keep current image'}
        </p>
      </div>

      {/* Category Select */}
      <div className="mb-4">
        <label htmlFor="category" className="block mb-2 font-medium">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="pakistan-news">Pakistan News</option>
          <option value="international-news">International News</option>
          <option value="sports-news">Sports News</option>
          <option value="business-news">Business News</option>
          <option value="health-news">Health News</option>
          <option value="science-news">Science News</option>
        </select>
      </div>

      {/* Article Content */}
      <div className="mb-6">
        <label htmlFor="article" className="block mb-2 font-medium">Content</label>
        <textarea
          id="article"
          name="article"
          value={formData.article}
          onChange={handleChange}
          className="w-full p-2 border rounded min-h-[200px]"
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isUpdating}
        className={`px-4 py-2 rounded text-white ${
          isUpdating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUpdating ? 'Updating...' : 'Update Post'}
      </button>
    </form>
  );
};

export default EditPostForm;