import React from 'react';

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="rtl text-right mb-4 space-x-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 border font-sans border-gray-300 rounded-lg ${
          editor.isActive('bold') ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 border font-sans border-gray-300 rounded-lg ${
          editor.isActive('italic') ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-3 py-1 border font-sans border-gray-300 rounded-lg ${
          editor.isActive('underline') ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Underline
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-3 py-1 border font-sans border-gray-300 rounded-lg ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Right Align
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-3 py-1 m-2 border font-sans border-gray-300 rounded-lg ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : 'bg-white'
        }`}
      >
        Left Align
      </button>
    </div>
  );
};

export default Toolbar;