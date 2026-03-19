const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    totalCopies: { type: Number, required: true, min: 1 },
    availableCopies: { type: Number, required: true, min: 0 },
    // Naya field admin ke liye to set custom return days per book
    returnDays: { type: Number, required: true, default: 14 } 
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);