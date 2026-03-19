import { useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [books, setBooks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [newBook, setNewBook] = useState({ title: '', author: '', category: '', totalCopies: '', returnDays: 14 });
    const [activeTab, setActiveTab] = useState('transactions');

    // 🔥 Modal State
    const [returnModal, setReturnModal] = useState({ show: false, transId: null, fine: '', student: '', book: '' });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [booksRes, transRes] = await Promise.all([api.get('/books'), api.get('/transactions/all')]);
            setBooks(booksRes.data);
            setTransactions(transRes.data);
        } catch (error) { console.error('Data fetch error', error); }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            await api.post('/books', newBook);
            setNewBook({ title: '', author: '', category: '', totalCopies: '', returnDays: 14 });
            fetchData();
            alert('Book Added Successfully!');
            setActiveTab('catalog'); 
        } catch (error) { alert('Failed to add book'); }
    };

    const handleDeleteBook = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await api.delete(`/books/${id}`);
                fetchData();
            } catch (error) { alert('Failed to delete book. It might be issued to someone.'); }
        }
    };

    // 🔥 Make sure this function fires
    const openReturnModal = (transaction) => {
        // Safe check for missing dates
        if (!transaction || !transaction.dueDate) return;

        const today = new Date();
        const due = new Date(transaction.dueDate);
        
        // Strip time to calculate pure days
        today.setHours(0,0,0,0);
        due.setHours(0,0,0,0);

        const diffTime = today - due;
        const daysLate = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Default to 0 if not late
        const estimatedFine = daysLate > 0 ? daysLate * 10 : 0; 
        
        setReturnModal({ 
            show: true, 
            transId: transaction._id, 
            fine: estimatedFine,
            student: transaction.user?.name || 'Unknown',
            book: transaction.book?.title || 'Unknown'
        });
    };

    // 🔥 Submit Return
    const submitReturn = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/transactions/return/${returnModal.transId}`, { fine: returnModal.fine });
            alert(`Book Returned! Final Fine Applied: ₹${data.fine}`);
            closeModal();
            fetchData();
        } catch (error) { 
            alert('Failed to process return'); 
            console.error(error);
        }
    };

    const closeModal = () => {
        setReturnModal({ show: false, transId: null, fine: '', student: '', book: '' });
    };

    return (
        <div className="min-h-screen pb-12 relative">
            <nav className="sticky top-0 z-40 bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center shadow-lg">
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Admin Portal</h1>
                <div className="flex items-center gap-4">
                    <span className="text-white font-medium bg-white/10 px-3 py-1 rounded-full">Admin: {user?.name}</span>
                    <button onClick={() => { logout(); navigate('/'); }} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white font-bold transition shadow-lg hover:shadow-red-500/40">Logout</button>
                </div>
            </nav>

            <div className="container mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-3xl h-fit shadow-xl">
                    <h2 className="text-xl font-bold mb-6 text-blue-300">➕ Publish New Book</h2>
                    <form onSubmit={handleAddBook} className="flex flex-col gap-4">
                        <input type="text" placeholder="Book Title" required className="p-4 bg-white/90 rounded-xl text-black font-medium outline-none focus:ring-2 focus:ring-blue-400" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                        <input type="text" placeholder="Author Name" required className="p-4 bg-white/90 rounded-xl text-black font-medium outline-none focus:ring-2 focus:ring-blue-400" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
                        <input type="text" placeholder="Category (e.g. Fiction, Tech)" required className="p-4 bg-white/90 rounded-xl text-black font-medium outline-none focus:ring-2 focus:ring-blue-400" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} />
                        <div className="flex gap-3">
                            <input type="number" placeholder="Total Copies" required min="1" className="w-1/2 p-4 bg-white/90 rounded-xl text-black font-medium outline-none focus:ring-2 focus:ring-blue-400" value={newBook.totalCopies} onChange={e => setNewBook({...newBook, totalCopies: e.target.value})} />
                            <input type="number" placeholder="Return Days" required min="1" className="w-1/2 p-4 bg-white/90 rounded-xl text-black font-medium outline-none focus:ring-2 focus:ring-blue-400" value={newBook.returnDays} onChange={e => setNewBook({...newBook, returnDays: e.target.value})} />
                        </div>
                        <button className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-4 rounded-xl text-white font-bold transition-all shadow-lg hover:-translate-y-1">Publish to Catalog</button>
                    </form>
                </div>

                <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-3xl shadow-xl flex flex-col">
                    <div className="flex gap-4 mb-6 border-b border-white/10 pb-4">
                        <button onClick={() => setActiveTab('transactions')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'transactions' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>Live Transactions</button>
                        <button onClick={() => setActiveTab('catalog')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'catalog' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>Published Books</button>
                    </div>

                    {activeTab === 'transactions' && (
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm text-gray-200">
                                <thead className="bg-black/40 text-gray-400">
                                    <tr><th className="p-4 rounded-tl-lg">Student</th><th className="p-4">Book</th><th className="p-4">Issue Date</th><th className="p-4">Due Date</th><th className="p-4">Status</th><th className="p-4 rounded-tr-lg">Action</th></tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No active transactions.</td></tr>}
                                    {transactions.map(t => (
                                        <tr key={t._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white">{t.user?.name}</td>
                                            <td className="p-4">{t.book?.title}</td>
                                            <td className="p-4">{new Date(t.issueDate).toLocaleDateString()}</td>
                                            <td className="p-4 text-red-600">{new Date(t.dueDate).toLocaleDateString()}</td>
                                            <td className="p-4">{t.status === 'issued' ? <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs border border-yellow-500/30">Issued</span> : <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs border border-green-500/30">Returned</span>}</td>
                                            <td className="p-4">
                                                {/* 🔥 Ensure this calls the function */}
                                                {t.status === 'issued' && (
                                                    <button 
                                                        onClick={() => openReturnModal(t)} 
                                                        className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white text-xs font-bold transition shadow-lg hover:shadow-green-500/40 cursor-pointer">
                                                        Process Return
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'catalog' && (
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm text-gray-200">
                                <thead className="bg-black/40 text-gray-400">
                                    <tr><th className="p-4 rounded-tl-lg">Title</th><th className="p-4">Author</th><th className="p-4">Category</th><th className="p-4">Availability</th><th className="p-4">Return Days</th><th className="p-4 rounded-tr-lg">Action</th></tr>
                                </thead>
                                <tbody>
                                    {books.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-500">No books published yet.</td></tr>}
                                    {books.map(book => (
                                        <tr key={book._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white">{book.title}</td>
                                            <td className="p-4">{book.author}</td>
                                            <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{book.category}</span></td>
                                            <td className="p-4 font-mono"><span className={book.availableCopies > 0 ? 'text-green-400' : 'text-red-400'}>{book.availableCopies}</span> / {book.totalCopies}</td>
                                            <td className="p-4">{book.returnDays} Days</td>
                                            <td className="p-4"><button onClick={() => handleDeleteBook(book._id)} className="text-red-400 hover:text-red-300 hover:bg-red-600/20 px-3 py-1 rounded transition cursor-pointer">🗑️ Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 Modal explicitly uses high z-index and pointer-events */}
            {returnModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="bg-gray-900 border border-gray-700 p-8 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] w-full max-w-md">
                        <h3 className="text-2xl font-bold text-white mb-2">Process Return</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Student: <strong className="text-white">{returnModal.student}</strong><br/>
                            Book: <strong className="text-white">{returnModal.book}</strong>
                        </p>
                        
                        <form onSubmit={submitReturn} className="flex flex-col gap-4">
                            <div>
                                <label className="text-gray-300 text-sm font-bold mb-2 block">Set Fine Amount (₹)</label>
                                <input type="number" min="0" required 
                                    className="w-full p-4 bg-gray-800 border border-gray-600 rounded-xl text-white font-bold text-lg outline-none focus:border-green-400 transition-all"
                                    value={returnModal.fine} onChange={e => setReturnModal({...returnModal, fine: e.target.value})} />
                                <p className="text-xs text-gray-500 mt-2">* Amount is auto-calculated based on due date. You can change it manually.</p>
                            </div>
                            
                            <div className="flex gap-4 mt-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition">Cancel</button>
                                <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all">Confirm Return</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;