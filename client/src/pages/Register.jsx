import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            login(data);
            
            // Direct navigation based on role
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/student');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] w-full max-w-md transform transition-all hover:scale-[1.02]">
                <h2 className="text-4xl font-extrabold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Create Account
                </h2>
                
                {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 mb-6 rounded-xl text-center backdrop-blur-sm">{error}</div>}
                
                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    {/* ✅ Sabhi inputs me white bg aur black text laga diya */}
                    <input type="text" placeholder="Full Name" required 
                        className="w-full bg-white/90 border border-gray-300 p-4 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-black placeholder-gray-500 transition-all font-medium"
                        value={name} onChange={(e) => setName(e.target.value)} />
                        
                    <input type="email" placeholder="Email Address" required 
                        className="w-full bg-white/90 border border-gray-300 p-4 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-black placeholder-gray-500 transition-all font-medium"
                        value={email} onChange={(e) => setEmail(e.target.value)} />
                        
                    <input type="password" placeholder="Password" required 
                        className="w-full bg-white/90 border border-gray-300 p-4 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-black placeholder-gray-500 transition-all font-medium"
                        value={password} onChange={(e) => setPassword(e.target.value)} />

                    <select 
                        className="w-full bg-white/90 border border-gray-300 p-4 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-black transition-all font-medium cursor-pointer"
                        value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button type="submit" 
                        className="mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white p-4 rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
                        Register
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-300">Already have an account? <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold underline decoration-2 underline-offset-4">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;