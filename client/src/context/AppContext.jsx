import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AppContext = createContext();

// 1. DEFINE BASE URL CORRECTLY (Works locally AND in Vercel)
const defaultAxios = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
});

export const AppProvider = ({ children }) => {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [blogs, setBlogs] = useState([]);
    const [input, setInput] = useState('');

    // Private Axios instance with token interceptor
    const privateAxios = useMemo(() => {
        const instance = defaultAxios.create();
        
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

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem('token');
                    setToken(null);
                    toast.error("Session expired or unauthorized. Please log in again.");
                    navigate('/admin'); 
                }
                return Promise.reject(error);
            }
        );
        
        return instance;
    }, [navigate, setToken]);

    // 2. FIX APPLIED: Use defaultAxios for public routes (e.g., fetching all blogs)
    const fetchBlogs = useCallback(async () => {
        try {
            // FIX: This now uses the defaultAxios instance with the correct baseURL 
            const { data } = await defaultAxios.get('/api/blog/all'); 
            
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, []); // Removed defaultAxios from deps as it's stable

    const fetchAdminBlogs = useCallback(async () => {
        try {
            // This correctly uses the privateAxios instance
            const { data } = await privateAxios.get('/api/admin/blogs');
            if (data.success) {
                setBlogs(data.blogs);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, [privateAxios]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) setToken(storedToken);
        fetchBlogs();
    }, [fetchBlogs]);

    const value = {
        axios: defaultAxios, // Provided for unauthenticated calls outside the context
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