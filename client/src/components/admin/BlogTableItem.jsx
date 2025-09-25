import React, { useState } from 'react';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const BlogTableItem = ({ blog, fetchBlogs, index }) => {
  const { axios } = useAppContext();
  const { title, createdAt } = blog;
  const BlogDate = new Date(createdAt);

  const [loading, setLoading] = useState(false);

  // 🚨 FIX APPLIED HERE: Added token retrieval and Authorization header 
  const handleRequest = async (url, payload, successMsg, errorMsg) => {
    setLoading(true);
    
    // 1. Get the JWT token from local storage
    const token = localStorage.getItem('token'); 
    
    if (!token) {
        setLoading(false);
        return toast.error("Authentication required. Please log in.");
    }

    try {
      // 2. Configure the headers to send the token with the 'Bearer' scheme
      const config = {
          headers: {
              Authorization: `Bearer ${token}`, 
          },
      };

      // The request failed on POST /api/blog/toggle-publish 
      const { data } = await axios.post(url, payload, config); // 👈 Pass the config object here
      
      if (data.success) {
        toast.success(data.message || successMsg);
        await fetchBlogs();
      } else {
        toast.error(data.message || errorMsg);
      }
    } catch (error) {
      // This will catch the 401 error and show a meaningful message
      toast.error(error?.response?.data?.message || 'Request failed. Check your network or login status.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete blog handler
  const deleteBlog = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this blog?');
    if (confirmDelete) {
      handleRequest(
        '/api/blog/delete',
        { id: blog?._id },
        'Blog deleted successfully',
        'Failed to delete blog'
      );
    }
  };

  // 🔹 Toggle publish handler
  const togglePublish = () => {
    // 🚨 NOTE: The browser log showed the URL as /api/blog/toggle-publish 
    // If your backend expects the ID as a URL parameter, the URL should be:
    // `/api/blog/toggle-publish/${blog?._id}` and the payload should be `{}`
    
    // Sticking to your original request format (ID in body):
    handleRequest(
      '/api/blog/toggle-publish',
      { id: blog?._id }, // Assuming backend expects { id: 'blogId' } in the body
      'Blog status updated',
      'Failed to update status'
    );
  };

  return (
    <tr className="border-y border-gray-300">
      <th className="px-2 py-4">{index}</th>
      <td className="px-2 py-4">{title}</td>
      <td className="px-2 py-4 max-sm:hidden">{BlogDate.toDateString()}</td>
      <td className="px-2 py-4 max-sm:hidden">
        <p
          className={
            blog?.isPublished ? 'text-green-600' : 'text-orange-700'
          }
        >
          {blog?.isPublished ? 'Published' : 'Unpublished'}
        </p>
      </td>
      <td className="px-2 py-4 flex text-xs gap-3">
        <button
          onClick={togglePublish}
          className={`border px-2 py-0.5 mt-1 rounded cursor-pointer ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {blog?.isPublished ? 'Unpublish' : 'Publish'}
        </button>
        <img
          onClick={deleteBlog}
          src={assets.cross_icon}
          className="w-8 hover:scale-110 transition-all cursor-pointer"
          alt="Delete blog"
        />
      </td>
    </tr>
  );
};

export default BlogTableItem;