import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { AuthProvider, AuthContext } from './context/AuthContext';

// 🛡️ Protected Route Logic
const ProtectedRoute = ({ children, roleRequired }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl font-bold animate-pulse bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                    Loading LibSys...
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" />;
    }

    if (roleRequired && user.role !== roleRequired) {
        return <Navigate to={user.role === 'admin' ? "/admin" : "/student"} />;
    }

    return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Main wrapper to ensure the background tint covers the full viewport */}
        <div className="min-h-screen w-full">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute roleRequired="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/student" 
                element={
                  <ProtectedRoute roleRequired="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;