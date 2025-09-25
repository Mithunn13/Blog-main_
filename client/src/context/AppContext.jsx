import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AppContext = createContext();

// Create a persistent, default instance once
const defaultAxios = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
});

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [blogs, setBlogs] = useState([]);
    const [input, setInput] = useState('');

    // 🚀 FIX: Use useMemo to set up the interceptor for the privateAxios instance
    // The instance itself is defined outside the component for stability.
    const privateAxios = useMemo(() => {
        // Create a *new* instance based on the default one to use for private calls
        const instance = defaultAxios.create();
        
        // Use an interceptor to inject the token into the headers before any request is sent
        instance.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token');
                if (currentToken) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Optional: Interceptor for response errors (e.g., auto-logout on 401)
        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Handle 401 errors: logout the user
                    localStorage.removeItem('token');
                    setToken(null);
                    toast.error("Session expired or unauthorized. Please log in again.");
                    navigate('/admin'); 
                }
                return Promise.reject(error);
            }
        );
        
        return instance;
    }, [navigate, setToken]); // Depend only on functions/variables that change the behavior (e.g., navigate)

    const fetchBlogs = useCallback(async () => {
        try {
            // Using plain axios for public routes
            const { data } = await axios.get('/api/blog/all');
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, []);

    const fetchAdminBlogs = useCallback(async () => {
        try {
            // Using the robust privateAxios instance
            const { data } = await privateAxios.get('/api/admin/blogs');
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            // The response interceptor above will handle 401 errors
            toast.error(error.response?.data?.message || error.message);
        }
    }, [privateAxios]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) setToken(storedToken);
        fetchBlogs();
    }, [fetchBlogs]);

    const value = {
        axios: defaultAxios, // Providing a stable default instance
        navigate,
        token,
        setToken,
        blogs,
        setBlogs,
        input,
        setInput,
        fetchBlogs,
        fetchAdminBlogs,
        privateAxios, // Authenticated Axios instance with interceptors
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);