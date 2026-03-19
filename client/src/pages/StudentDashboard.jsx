import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [myBooks, setMyBooks] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [booksRes, myBooksRes] = await Promise.all([api.get('/books'), api.get('/transactions/mybooks')]);
            setBooks(booksRes.data);
            setMyBooks(myBooksRes.data);
        } catch (error) { console.error(error); }
    };

    const handleBorrow = async (bookId) => {
        try {
            await api.post('/transactions/borrow', { bookId });
            alert('Book Borrowed Successfully!');
            fetchData();
        } catch (error) { alert(error.response?.data?.message || 'Failed to borrow'); }
    };

    const filteredBooks = books.filter(b => 
        (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())) &&
        (category === '' || b.category === category)
    );
    const categories = [...new Set(books.map(b => b.category))];

    const calculateEstimatedFine = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = today - due;
        const daysLate = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return daysLate > 0 ? daysLate * 10 : 0;
    };

    return (
        <div className="min-h-screen pb-12">
            {/* 🧭 Responsive Navbar */}
            <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
                <h1 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                    Student Portal
                </h1>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-white text-sm font-medium bg-white/10 px-3 py-1 rounded-full border border-white/5">
                        👤 {user?.name}
                    </span>
                    <button onClick={() => { logout(); navigate('/'); }} className="bg-red-500/80 hover:bg-red-600 px-4 py-1.5 rounded-lg text-white text-sm font-bold transition shadow-lg hover:shadow-red-500/20">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mx-auto mt-6 md:mt-8 px-4">
                
                {/* 🔍 RESPONSIVE Search & Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Search by title or author..." 
                            className="w-full p-4 pl-12 rounded-2xl bg-white/90 text-black font-medium outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-xl" 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
                    </div>
                    
                    <select 
                        className="w-full md:w-64 p-4 rounded-2xl bg-white/90 text-black font-semibold outline-none cursor-pointer shadow-xl focus:ring-2 focus:ring-blue-400 appearance-none" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">📚 All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 📖 Book Catalog */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <h2 className="text-xl font-bold mb-4 text-blue-300 px-1">Available Books</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {filteredBooks.map(book => (
                                <div key={book._id} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl hover:-translate-y-1 transition duration-300 shadow-lg flex flex-col justify-between group">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] uppercase tracking-wider bg-blue-500/20 text-blue-200 px-2 py-1 rounded-md border border-blue-500/30 font-bold">
                                                {book.category}
                                            </span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${book.availableCopies > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                {book.availableCopies > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold mt-4 text-white group-hover:text-blue-300 transition-colors">{book.title}</h3>
                                        <p className="text-gray-400 text-xs mb-4 italic">by {book.author}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 uppercase">Available</span>
                                            <span className="text-sm font-bold text-white">{book.availableCopies} <span className="text-gray-500 font-normal">/ {book.totalCopies}</span></span>
                                        </div>
                                        <button 
                                            onClick={() => handleBorrow(book._id)} 
                                            disabled={book.availableCopies <= 0}
                                            className={`px-5 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow-lg ${book.availableCopies > 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}>
                                            {book.availableCopies > 0 ? `Borrow (${book.returnDays}d)` : 'Sold Out'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🎒 My Borrowed Books Card */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-fit shadow-2xl sticky top-28">
                            <h2 className="text-xl font-bold mb-6 text-green-300 flex items-center gap-2">
                                <span>🎒</span> My Collection
                            </h2>
                            <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {myBooks.length === 0 ? (
                                    <div className="text-center py-8 opacity-40">
                                        <p className="text-3xl mb-2">📖</p>
                                        <p className="text-sm">Empty Shelf</p>
                                    </div>
                                ) : null}
                                {myBooks.map(t => {
                                    const estimatedFine = t.status === 'issued' ? calculateEstimatedFine(t.dueDate) : t.fine;
                                    return (
                                        <div key={t._id} className="bg-black/30 p-4 rounded-2xl border border-white/5 hover:border-white/20 transition-all">
                                            <h4 className="font-bold text-white text-sm line-clamp-1">{t.book?.title}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${t.status === 'issued' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {t.status.toUpperCase()}
                                                </span>
                                                {t.status === 'issued' && (
                                                    <span className="text-[9px] text-blue-300 font-mono">
                                                        Due: {new Date(t.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {estimatedFine > 0 && (
                                                <div className="mt-3 bg-red-500/10 border border-red-500/20 p-2 rounded-xl flex justify-between items-center">
                                                    <span className="text-[10px] text-red-300 font-bold uppercase tracking-tighter">Fine Amount</span>
                                                    <span className="text-red-400 font-black text-sm">₹{estimatedFine}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;