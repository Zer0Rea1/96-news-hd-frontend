import React, { useState } from 'react';
import TipTapEditor from '../../components/portal/components/TipTapEditor.jsx';
import ThumbnailUploader from '../../components/portal/components/ThumbnailUploader.jsx';
const NewPost = () => {
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleThumbnailUpload = (image) => {
    setThumbnail(image);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Blog Content:', content);
    console.log('Thumbnail:', thumbnail);
    console.log("fdjfgdsfgi")
  };

  return (
    <form onSubmit={handleSubmit} className="ltr font-jameel-noori text-left p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        
        <div className="mb-4">
          <label className="block text-3xl font-medium mb-2">Thumbnail</label>
          <ThumbnailUploader onImageUpload={handleThumbnailUpload} />
        </div>

        <label htmlFor="title" className="block text-3xl font-medium mb-2">Topic</label>
        <input
          type="text"
          id="title"
          name="title"
          className="w-full p-2 border border-gray-300 rounded-lg text-right focus:border-gray-500 focus:outline-hidden bg-gray-100 shadow-xl text-2xl "
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-3xl font-medium mb-2">Content</label>
        <TipTapEditor value={content} onChange={handleContentChange} />
      </div>
      <button
        type="submit"
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-3xl"
      >
        Submit
      </button>
      {/* <div
        className="preview mt-6 p-4 border border-gray-300 rounded-lg rtl text-right"
        dangerouslySetInnerHTML={{ __html: content }}
      ></div> */}
    </form>
  );
};

export default NewPost;