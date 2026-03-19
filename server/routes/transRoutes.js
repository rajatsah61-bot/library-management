const express = require('express');
const { borrowBook, getAllTransactions, getMyBooks, returnBook } = require('../controllers/transController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Student Routes
router.post('/borrow', protect, borrowBook);
router.get('/mybooks', protect, getMyBooks);

// Admin Routes
router.get('/all', protect, admin, getAllTransactions);
router.put('/return/:id', protect, admin, returnBook);

module.exports = router;