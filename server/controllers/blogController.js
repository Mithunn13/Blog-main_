import fs from 'fs';
import imagekit from '../configs/imageKit.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';

export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(req.body.blog);
    const imageFile = req.file;

    // Check if all fields are present
    if (!title || !description || !category || !imageFile) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(imageFile.path);

    // Upload Image to ImageKit
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs"
    });

    // Optimization through ImageKit URL transformation
    const optimizedImageUrl = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: 'auto' },   // Auto compression
        { format: 'webp' },    // Convert to modern format
        { width: '1280' }      // Resize width
      ]
    });

    const image = optimizedImageUrl;

    // Save blog to DB
    await Blog.create({
      title,
      subTitle,
      description,
      category,
      image,
      isPublished
    });

    res.json({ success: true, message: "Blog added successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
export const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isPublished: true });
        res.json({ success: true, blogs: blogs });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blogId = req.params.blogId; // ✅ match the route param
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        res.json({ success: true, blog });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteBlogById = async (req, res) => {
    try {
        const { id } = req.body;
        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        // Delete all comments associated with the blog
        await Comment.deleteMany({ blog: id });

        res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const togglePublish = async (req, res) => {
    try {
        const { id } = req.body;
        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        blog.isPublished = !blog.isPublished;
        await blog.save();

        res.json({ success: true, message: 'Blog status updated', isPublished: blog.isPublished });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
export const addComment = async (req, res) => {
    try {
        const { blog, name, content } = req.body;
        await Comment.create({blog, name, content});
        res.json({success: true, message: 'Comment added for review'})
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.body;
        const comments = await Comment.find({ blog: blogId, isApproved: true }).sort({ createdAt: -1 });
        res.json({ success: true, comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
// blog.controller.js

export const generateContent = async (req, res)=>{
  try {
    const { prompt } = req.body;
    
    // 🚨 FIX: Restructure the prompt to clearly include the variable
    const fullPrompt = `Generate a blog post about the topic: "${prompt}". The content should be provided in simple text format, suitable for direct insertion into a blog editor.`;
    
    // Pass the restructured prompt to the Gemini function
    const content = await main(fullPrompt); 

    res.json({success: true, content})
  } catch (error) {
    res.json({success: false, message: error.message})
  }
}