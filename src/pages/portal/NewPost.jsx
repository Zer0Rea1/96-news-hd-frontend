import React, { useState } from 'react';
import TipTapEditor from '../../components/portal/components/TipTapEditor.jsx';
import ThumbnailUploader from '../../components/portal/components/ThumbnailUploader.jsx';
import { useProfileContext } from '../../context/ProfileContext.jsx';
import api from '../../api/apis.js';
const NewPost = () => {
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [category, setcategory] = useState('');
  const [Title, setTitle] = useState('')
  const [Loading, setLoading] = useState(false)
  const { profile, isLoading } = useProfileContext();
  const handleContentChange = (value) => {
    setContent(value);
  };

  const handleThumbnailUpload = (image) => {
    setThumbnail(image);
  };
  const handleSelect = (event) => {
        setcategory(event.target.value);
        
      };

  const handleSubmit = async (e) => {
    setLoading(true)
    e.preventDefault();
    console.log('Blog Content:',profile.userId, Title,content,category,thumbnail);
    const response = await api.post('api/newpost',{
      title: Title,
      article: content,
      thumbnailImage: thumbnail,
      category: category,
      authorid: profile.userId
    })

    if (response.status == 201){
      console.log("post was created")
      setLoading(false)

    }else{
      console.log("there was a problem with posting the post please try again")
    }
    
  };

  return (
    <form onSubmit={handleSubmit} className="ltr  text-left p-4 max-w-2xl mx-auto">
      <div className="mb-4">
        
        <div className="mb-4">
          <label className="block text-3xl font-medium mb-2">Thumbnail</label>
          <ThumbnailUploader onImageUpload={handleThumbnailUpload} />
        </div>

        <label htmlFor="title" className="block text-3xl font-medium mb-2">Titile</label>
        <input
        required
          onChange={(e)=>{setTitle(e.target.value)}}
          type="text"
          id="title"
          name="title"
          className="font-jameel-noori w-full p-2 border border-gray-300 rounded-lg text-right focus:border-gray-500 focus:outline-hidden bg-gray-100 shadow-xl text-2xl "
        />
      </div>
      <div>
        <h1 className='text-3xl my-4'>Select news category</h1>
        <select name="category" required value={category} onChange={handleSelect} id="category" className='m-4 text-2xl border-2 rounded'>
          <option value=''>select</option>
          <option value='pakistan-news'>paksitan News</option>
          <option value='international-news'>international news</option>
          <option value='sports-news'>sports news</option>
          <option value='business-news'>bussiness news</option>
          <option value='health-news'>health news</option>
          <option value='science-news'>science news</option>
        </select>
        {category==''&&"Please select the value"}
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-3xl font-medium mb-2">Content</label>
        <TipTapEditor value={content} onChange={handleContentChange} />
      </div>
      <button
        disabled={isLoading}
        type="sumit"
        id='submit'
        className="bg-red-600  text-white px-4 py-2 rounded-lg hover:bg-red-700 text-3xl"
      >
       
        {Loading ? "Creating Post" : "Create Post"}
      </button>
      {/* <div
        className="preview mt-6 p-4 border border-gray-300 rounded-lg rtl text-right"
        // dangerouslySetInnerHTML={{ __html: content }}
      ></div> */}
    </form>
  );
};

export default NewPost;