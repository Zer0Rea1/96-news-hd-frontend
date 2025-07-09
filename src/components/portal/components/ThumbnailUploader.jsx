import React, { useState } from 'react';

const ThumbnailUploader = ({ onImageUpload }) => {
  const [image, setImage] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        onImageUpload(reader.result); // Pass the uploaded image to the parent component
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full max-w-[1280px] h-[200px] sm:h-[540px] md:h-[200px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer">
      {image ? (
        <img
          src={image}
          alt="Uploaded Thumbnail"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          <p className="mt-2 text-gray-500 font-sans">Upload Thumbnail</p>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
};

export default ThumbnailUploader;