import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            // 1. Pehle context update karo
            login(data);
            
            // 2. Direct navigate karo role ke basis par (No more /dashboard)
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed! Check credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-md transform transition-all hover:scale-[1.02]">
                <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    peaceinlibrary Login
                </h2>
                
                {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 mb-6 rounded-xl text-center backdrop-blur-sm">{error}</div>}
                
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                    <input type="email" placeholder="Email Address" required 
                        className="w-full bg-white/90 border border-gray-300 p-4 rounded-xl outline-none focus:border-purple-500 text-black placeholder-gray-500 transition-all font-medium"
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" required 
                        className="w-full bg-white/90 border border-gray-300 p-4 rounded-xl outline-none focus:border-purple-500 text-black placeholder-gray-500 transition-all font-medium"
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 text-white p-4 rounded-xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-1">
                        Enter Library
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-300">Don't have an account? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-bold underline decoration-2">Register now</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;