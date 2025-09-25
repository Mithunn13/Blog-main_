import React, { useState } from 'react'
// Removed blogCategories and blog_data import as they are likely local mock data 
// and the app now uses real MERN backend data.
import { motion } from 'framer-motion'
import BlogCard from './BlogCard'
import { useAppContext } from '../context/AppContext';

// Hardcoding categories based on the previous AddBlog component, or you can fetch/derive this list.
const categories = ["All", "Startup", "AI", "Tech", "Health"];

const BlogList = () => {
  const [menu, setMenu] = useState("All")
  // Ensure blogs is defensively checked (though it should be an array from context)
  const { blogs = [], input } = useAppContext() 

  // Combined filtering function
  const filteredBlogs = () => {
    // 1. Filter by Category (menu)
    const categoryFiltered = menu === "All" 
      ? blogs 
      : blogs.filter(blog => blog.category.toLowerCase() === menu.toLowerCase());
    
    // 2. Filter by Search Input
    if (input === '') {
      return categoryFiltered;
    }
    
    return categoryFiltered.filter(blog => 
      blog.title.toLowerCase().includes(input.toLowerCase()) || 
      blog.category.toLowerCase().includes(input.toLowerCase())
    );
  }

  // NOTE: The previous version was slightly redundant, applying both filters twice.
  // The structure below simplifies it by just calling filteredBlogs() once in the JSX.


  return (
    <div>
      {/* Category Navigation Tabs */}
      <div className='flex justify-center gap-4 sm:gap-8 my-10 relative'>
        {categories.map((item) => (
          <div key={item} className='relative'>
            <button
              onClick={() => setMenu(item)}
              className={`cursor-pointer text-gray-500 px-4 pt-0.5 ${
                menu === item && 'text-white'
              }`}
            >
              {item}
              {/* Framer Motion Underline Animation */}
              {menu === item && (
                <motion.div
                  layoutId='underline'
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className='absolute left-0 right-0 top-0 h-7 -z-1 bg-primary rounded-full'
                />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 mb-24 mx-8 sm:mx-16 xl:mx-40'>
        {/* Render the fully filtered list of blogs */}
        {filteredBlogs().map((blog) => (
          // Assuming BlogCard handles all the individual blog data presentation
          <BlogCard key={blog._id} blog={blog} />
        ))}
      </div>
    </div>
  )
}

export default BlogList