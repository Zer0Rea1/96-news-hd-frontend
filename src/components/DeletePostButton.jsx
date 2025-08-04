import { React, useState, useEffect } from 'react'
import api from '../api/apis';
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
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
            {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
    )
}

export default DeletePostButton