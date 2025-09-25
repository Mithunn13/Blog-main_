import React, { useState, useRef, useEffect } from 'react';
import uploadArea from '../../assets/upload_area.svg';
import { useAppContext } from "../../context/AppContext";
import toast from 'react-hot-toast';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { parse } from 'marked';

const AddBlog = () => {
    // Context to access Axios instance and fetchBlogs function
    const { axios, fetchBlogs } = useAppContext(); 
    
    // State for form submission and AI content generation loading
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false); 

    // Refs for Quill editor
    const editorRef = useRef(null);
    const quillRef = useRef(null);

    // State for form fields
    // Set initial state to empty string to show "Select category" by default
    const [category, setCategory] = useState(''); 
    const [isPublished, setIsPublished] = useState(false);
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [description, setDescription] = useState('');

    // Initialize Quill editor on component mount
    useEffect(() => {
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
            });
            // Update description state whenever content changes
            quillRef.current.on('text-change', () => {
                setDescription(quillRef.current.root.innerHTML);
            });
        }
    }, []);

    // Function to generate content using AI (Gemini)
    const generateContent = async () => {
        if (!title) return toast.error('Please enter a title');

        // Retrieve token and set headers for protected AI route
        const token = localStorage.getItem('token');
        if (!token) {
            return toast.error("Authentication required to use AI features.");
        }
        
        try {
            setLoading(true); // Start loading spinner
            
            // Configuration for the Authorization header
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            
            // API call to the backend endpoint, passing the config
            const { data } = await axios.post('/api/blog/generate', { prompt: title }, config);

            if (data.success) {
                // Convert markdown content to HTML and set it in the Quill editor
                if (quillRef.current) {
                    quillRef.current.root.innerHTML = parse(data.content);
                }
                toast.success("AI Content generated successfully.");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "AI generation failed. Please try logging in again.");
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    // Form submission handler
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsAdding(true);

        const blog = {
            title,
            subTitle,
            description,
            category,
            isPublished,
        };

        const formData = new FormData();
        formData.append('blog', JSON.stringify(blog));
        if (image) {
            formData.append('image', image);
        }

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post('/api/blog/add', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (data.success) {
                toast.success(data.message);
                await fetchBlogs(); // Refresh blog list

                // Reset the form fields
                setImage(null);
                setTitle('');
                setSubTitle('');
                setIsPublished(false);
                setCategory(''); // Reset category to empty string
                if (quillRef.current) {
                    quillRef.current.root.innerHTML = '';
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <form
            onSubmit={onSubmitHandler}
            className="flex-1 bg-blue-50/50 text-gray-600 h-full overflow-scroll"
        >
            <div className="bg-white w-full max-w-3xl p-4 md:p-10 sm:m-10 shadow rounded">
                
                {/* Upload Thumbnail */}
                <p>Upload thumbnail</p>
                <label htmlFor="image">
                    <img
                        src={image ? URL.createObjectURL(image) : uploadArea}
                        alt="Upload"
                        className="mt-2 h-16 rounded cursor-pointer"
                    />
                    <input
                        onChange={(e) => setImage(e.target.files[0])}
                        type="file"
                        id="image"
                        hidden
                        required
                    />
                </label>

                {/* Blog Title */}
                <p className="mt-4">Blog title</p>
                <input
                    type="text"
                    placeholder="Type here"
                    required
                    className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                />

                {/* Sub Title */}
                <p className="mt-4">Sub title</p>
                <input
                    type="text"
                    placeholder="Type here"
                    required
                    className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
                    onChange={(e) => setSubTitle(e.target.value)}
                    value={subTitle}
                />

                {/* Blog Description (Quill Editor with AI Button) */}
                <p className="mt-4">Blog Description</p>
                <div className="max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative">
                    <div ref={editorRef} />
                    
                    {/* Loading Spinner for AI Generation */}
                    {loading && (
                        <div className="absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center bg-black/10 mt-2">
                            <div className="w-8 h-8 rounded-full border-2 border-t-white animate-spin"></div>
                        </div>
                    )}
                    
                    {/* AI Generate Button */}
                    <button
                        disabled={loading} // Disable button while loading
                        type="button"
                        onClick={generateContent}
                        className="absolute bottom-1 right-2 ml-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:underline cursor-pointer"
                    >
                        Generate with AI
                    </button>
                </div>

                {/* Blog Category */}
                <p className="mt-4">Blog category</p>
                <select
                    name="category"
                    className="mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded"
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                >
                    {/* UPDATED CATEGORIES to match tutorial screenshot */}
                    <option value="">Select category</option>
                    <option value="All">All</option>
                    <option value="Technology">Technology</option>
                    <option value="Startup">Startup</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Finance">Finance</option>
                </select>

                {/* Publish Toggle */}
                <div className="flex gap-2 mt-4 items-center">
                    <p>Publish Now</p>
                    <input
                        type="checkbox"
                        checked={isPublished}
                        className="scale-125 cursor-pointer"
                        onChange={(e) => setIsPublished(e.target.checked)}
                    />
                </div>

                {/* Submit Button */}
                <button
                    disabled={isAdding}
                    type="submit"
                    className="mt-8 w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm"
                >
                    {isAdding ? 'Adding...' : 'Add Blog'}
                </button>
            </div>
        </form>
    );
};

export default AddBlog;