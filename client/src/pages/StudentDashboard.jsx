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
            fetchData(); // Refresh UI to update available count instantly
        } catch (error) { alert(error.response?.data?.message || 'Failed to borrow'); }
    };

    const filteredBooks = books.filter(b => 
        (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())) &&
        (category === '' || b.category === category)
    );
    const categories = [...new Set(books.map(b => b.category))];

    // 🔥 NEW: Helper function to calculate estimated fine for students
    const calculateEstimatedFine = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = today - due;
        const daysLate = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysLate > 0) {
            return daysLate * 10; // Assuming ₹10 fine per day
        }
        return 0;
    };

    return (
        <div className="min-h-screen pb-12">
            <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center shadow-lg">
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Student Portal</h1>
                <div className="flex items-center gap-4">
                    <span className="text-white font-medium bg-white/10 px-3 py-1 rounded-full">Student: {user?.name}</span>
                    <button onClick={() => { logout(); navigate('/'); }} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-bold transition shadow-lg hover:shadow-red-500/40">Logout</button>
                </div>
            </nav>

            <div className="container mx-auto mt-8 px-4">
                {/* Search & Filter */}
                <div className="flex gap-4 mb-8">
                    <input type="text" placeholder="Search Title or Author..." className="flex-1 p-4 rounded-xl bg-white/90 text-black font-medium outline-none focus:ring-2 focus:ring-blue-400" value={search} onChange={e => setSearch(e.target.value)} />
                    <select className="p-4 rounded-xl bg-white/90 text-black font-medium outline-none cursor-pointer" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Catalog */}
                    <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
                        {filteredBooks.map(book => (
                            <div key={book._id} className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl hover:-translate-y-1 transition duration-300 shadow-lg flex flex-col justify-between">
                                <div>
                                    <span className="text-xs bg-blue-500/30 text-blue-200 px-2 py-1 rounded-full">{book.category}</span>
                                    <h3 className="text-xl font-bold mt-3 text-white">{book.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4">By {book.author}</p>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className={`text-sm font-bold ${book.availableCopies > 0 ? 'text-green-400' : 'text-red-400'}`}>{book.availableCopies} Available</span>
                                    <button 
                                        onClick={() => handleBorrow(book._id)} 
                                        disabled={book.availableCopies <= 0}
                                        className={`px-4 py-2 rounded font-bold text-white transition ${book.availableCopies > 0 ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/40' : 'bg-gray-600 cursor-not-allowed'}`}>
                                        {book.availableCopies > 0 ? `Borrow (${book.returnDays} Days)` : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* My Borrowed Books */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl h-fit">
                        <h2 className="text-xl font-bold mb-4 text-green-300">My Borrowed Books</h2>
                        <div className="flex flex-col gap-3">
                            {myBooks.length === 0 ? <p className="text-gray-400 text-sm">You haven't borrowed any books yet.</p> : null}
                            {myBooks.map(t => {
                                // Calculate fine specific to this transaction
                                const estimatedFine = t.status === 'issued' ? calculateEstimatedFine(t.dueDate) : t.fine;

                                return (
                                    <div key={t._id} className="bg-black/20 p-4 rounded-xl border border-white/5 transition-all hover:bg-black/30">
                                        <h4 className="font-bold text-white">{t.book?.title}</h4>
                                        <p className="text-xs text-gray-400 mt-1">Status: <span className={`font-bold ${t.status === 'issued' ? 'text-yellow-400' : 'text-green-400'}`}>{t.status.toUpperCase()}</span></p>
                                        
                                        {t.status === 'issued' && (
                                            <p className="text-xs text-blue-300 mt-1 font-mono">
                                                Due Date: {new Date(t.dueDate).toLocaleDateString()}
                                            </p>
                                        )}
                                        
                                        {/* 🔥 UPDATED: Fine Display Box */}
                                        {estimatedFine > 0 && (
                                            <div className="mt-2 bg-red-500/20 border border-red-500/30 p-2 rounded-lg text-xs flex justify-between items-center">
                                                <span className="text-red-300 font-medium">
                                                    {t.status === 'issued' ? '⚠ Estimated Late Fine:' : '✅ Pay Fine:'}
                                                </span>
                                                <span className="text-red-400 font-bold text-sm">₹{estimatedFine}</span>
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
    );
};
export default StudentDashboard;