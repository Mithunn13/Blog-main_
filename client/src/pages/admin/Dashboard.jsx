import React, { useEffect, useState, useCallback } from 'react';
import { assets } from '../../assets/assets';
import BlogTableItem from "../../components/admin/BlogTableItem";
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    blogs: 0,
    comments: 0,
    drafts: 0,
    recentBlogs: []
  });

  // Correctly get privateAxios from the context
  const { privateAxios, token } = useAppContext();

  const fetchDashboard = useCallback(async () => {
    try {
      // Use the privateAxios instance for the authenticated call
      if (!privateAxios) return; // Guard against a null instance
      const { data } = await privateAxios.get('/api/admin/dashboard');
      if (data.success) {
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Dashboard fetch error:", error);
    }
  }, [privateAxios]); // Dependency is now privateAxios

  useEffect(() => {
    // Only call fetchDashboard when both the token and privateAxios are available
    if (token && privateAxios) {
      fetchDashboard();
    }
  }, [token, privateAxios, fetchDashboard]);

  return (
    <div className='flex-1 p-4 md:p-10 bg-blue-50/50'>
      {/* Stats Cards */}
      <div className='flex flex-wrap gap-4'>
        {/* Blogs Card */}
        <div className='flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow cursor-pointer hover:scale-105 transition-all'>
          <img src={assets.dashboard_icon_1} alt="Blogs Icon" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashboardData.blogs}</p>
            <p className='text-gray-400 font-light'>Blogs</p>
          </div>
        </div>

        {/* Comments Card */}
        <div className='flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow cursor-pointer hover:scale-105 transition-all'>
          <img src={assets.dashboard_icon_2} alt="Comments Icon" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashboardData.comments}</p>
            <p className='text-gray-400 font-light'>Comments</p>
          </div>
        </div>

        {/* Drafts Card */}
        <div className='flex items-center gap-4 bg-white p-4 min-w-58 rounded shadow cursor-pointer hover:scale-105 transition-all'>
          <img src={assets.dashboard_icon_3} alt="Drafts Icon" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashboardData.drafts}</p>
            <p className='text-gray-400 font-light'>Drafts</p>
          </div>
        </div>
      </div>

      {/* Latest Blogs Table */}
      <div>
        <div className='flex items-center gap-3 m-4 mt-6 text-gray-600'>
          <img src={assets.dashboard_icon_4} alt="Recent Blogs Icon" />
          <p>Latest Blogs</p>
        </div>

        <div className='relative max-w-4xl overflow-x-auto shadow rounded-lg scrollbar-hide bg-white'>
          <table className='w-full text-sm text-gray-500'>
            <thead className='text-xs text-gray-600 text-left uppercase'>
              <tr>
                <th scope="col" className='px-2 py-4 xl:px-6'>#</th>
                <th scope="col" className='px-2 py-4'>Blog Title</th>
                <th scope="col" className='px-2 py-4 max-sm:hidden'>Date</th>
                <th scope="col" className='px-2 py-4 max-sm:hidden'>Status</th>
                <th scope="col" className='px-2 py-4'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentBlogs.map((blog, index) => (
                <BlogTableItem
                  key={blog._id}
                  blog={blog}
                  fetchBlogs={fetchDashboard}
                  index={index + 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
