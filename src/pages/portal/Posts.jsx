import React, { useEffect, useState } from 'react'
import api from '../../api/apis';
import { useProfileContext } from '../../context/ProfileContext.jsx';
import { useAuthContext } from '../../context/AuthContext';
import DeletePostButton from '../../components/portal/components/DeletePostButton.jsx';
import EditPostForm from '../../components/portal/components/EditPostForm.jsx';
import { Link } from 'react-router';
const Posts = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const { profile, isLoading } = useProfileContext();
    const { isAuthenticated } = useAuthContext();
    const handleUpdateSuccess = (updatedPost) => {
    setPosts(posts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    ));
  };
    const handleDeleteSuccess = (deletedPostId) => {
        // Update state to remove the deleted post
        setPosts(posts.filter(post => post._id !== deletedPostId));
    };

    useEffect(() => {
        const getPosts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/getPostByuser');
                setPosts(response.data);
            } catch (err) {
                console.error('Payment request fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            getPosts();
        }
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Posts</h1>

            {posts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No posts found. Create your first post!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={post.thumbnailImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover contain-content"
                                />
                            </div>
                            <div className="p-4">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                                    {post.category}
                                </span>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    {/* <button className="text-blue-600 hover:text-blue-800 font-medium">
                                        View Details
                                    </button> */}
                                    <DeletePostButton
                                        postId={post._id}
                                        onDelete={handleDeleteSuccess}  // Passing the function as prop
                                    />
                                    <Link to={`/portal/editpost/${post._id}`}>Edit Post</Link>
                                    <span className="text-sm text-gray-500">
                                        {new Date(post.dateandtime).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Posts