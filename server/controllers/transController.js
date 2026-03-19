const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

exports.borrowBook = async (req, res) => {
    try {
        const { bookId } = req.body;
        const userId = req.user._id;
        
        const book = await Book.findById(bookId);
        if (!book || book.availableCopies <= 0) return res.status(400).json({ message: 'Book unavailable' });

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + book.returnDays);

        const transaction = await Transaction.create({ user: userId, book: bookId, dueDate });
        book.availableCopies -= 1;
        await book.save();

        res.status(201).json(transaction);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate('user', 'name email').populate('book', 'title author').sort('-createdAt');
        res.json(transactions);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMyBooks = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).populate('book', 'title author').sort('-createdAt');
        res.json(transactions);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 🔥 UPDATED: Return Book (Custom Fine Logic)
exports.returnBook = async (req, res) => {
    try {
        const { fine } = req.body; // Frontend se aayega
        const transaction = await Transaction.findById(req.params.id).populate('book');
        
        if (!transaction || transaction.status === 'returned') {
            return res.status(400).json({ message: 'Invalid or already returned' });
        }

        transaction.status = 'returned';
        transaction.returnDate = new Date();

        // Agar admin ne manual fine daala hai, toh wo set karo, warna auto-calculate karo
        if (fine !== undefined && fine !== null && fine !== '') {
            transaction.fine = Number(fine);
        } else {
            const daysLate = Math.floor((transaction.returnDate - transaction.dueDate) / (1000 * 60 * 60 * 24));
            if (daysLate > 0) transaction.fine = daysLate * parseInt(process.env.FINE_PER_DAY || 10);
        }

        await transaction.save();

        const book = await Book.findById(transaction.book._id);
        book.availableCopies += 1;
        await book.save();

        res.json(transaction);
    } catch (error) { res.status(500).json({ message: error.message }); }
};