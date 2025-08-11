import { React, useState, useEffect } from 'react'
import api from '../../../api/apis';
const DeletePostButton = ({ postId, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            setIsDeleting(true);
            try {
                await api.delete(`/api/posts/${postId}`);
                onDelete(postId); // Callback to update parent component
            } catch (error) {
                console.error('Delete failed:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };
    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="border-red-500 border-2 text-red-500 h-full  p-2 rounded-xl hover:bg-red-100 pointer-coarse"
        >
            {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
    )
}

export default DeletePostButton