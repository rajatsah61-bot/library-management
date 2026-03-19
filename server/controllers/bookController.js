const Book = require('../models/Book');

exports.getBooks = async (req, res) => {
    try {
        const keyword = req.query.keyword ? {
            $or: [
                { title: { $regex: req.query.keyword, $options: 'i' } },
                { author: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};
        const books = await Book.find({ ...keyword });
        res.json(books);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addBook = async (req, res) => {
    try {
        // Naya field returnDays accept karo
        const { title, author, category, totalCopies, returnDays } = req.body;
        const book = await Book.create({
            title, author, category, totalCopies, availableCopies: totalCopies, returnDays: returnDays || 14
        });
        res.status(201).json(book);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(book);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book removed' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};