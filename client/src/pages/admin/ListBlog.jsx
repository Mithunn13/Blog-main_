import React, { useState, useEffect, useCallback } from 'react';
import BlogTableItem from '../../components/admin/BlogTableItem';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const ListBlog = () => {
    const [blogs, setBlogs] = useState([]);
    
    // 🚀 CRITICAL FIX: Destructure privateAxios for protected routes
    const { privateAxios } = useAppContext();

    // Wrapped in useCallback for better performance, and to include privateAxios as dependency
    const fetchBlogs = useCallback(async () => {
        try {
            // Guard against null privateAxios during initialization
            if (!privateAxios) return;

            // Use privateAxios for the protected admin route
            const { data } = await privateAxios.get('/api/admin/blogs');
            
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }, [privateAxios]); // Depend on privateAxios to rerun when the instance becomes ready

    useEffect(() => {
        // Only call fetchBlogs when privateAxios is ready
        if (privateAxios) {
            fetchBlogs();
        }
    }, [fetchBlogs, privateAxios]);

    return (
        <div className="flex-1 pt-5 px-5 sm:pt-12 sm:pl-16 bg-blue-50/50">
            <h1>All blogs</h1>
            <div className="relative h-4/5 mt-4 max-w-4xl overflow-x-auto shadow rounded-lg scrollbar-hide bg-white">
                <table className="w-full text-sm text-gray-500">
                    <thead className="text-xs text-gray-600 text-left uppercase">
                        <tr>
                            <th scope="col" className="px-2 py-4 xl:px-6">#</th>
                            <th scope="col" className="px-2 py-4">Blog Title</th>
                            <th scope="col" className="px-2 py-4 max-sm:hidden">Date</th>
                            <th scope="col" className="px-2 py-4 max-sm:hidden">Status</th>
                            <th scope="col" className="px-2 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs.map((blog, index) => (
                            <BlogTableItem
                                key={blog._id}
                                blog={blog}
                                fetchBlogs={fetchBlogs} // Pass local fetch function
                                index={index + 1}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListBlog;