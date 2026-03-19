import axios from 'axios';

const api = axios.create({
    // Vite me environment variable aise access karte hain
    baseURL: import.meta.env.VITE_API_URL, 
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) config.headers.Authorization = `Bearer ${user.token}`;
    return config;
}, (error) => Promise.reject(error));

export default api;