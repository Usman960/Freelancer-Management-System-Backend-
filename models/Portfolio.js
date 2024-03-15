const mongoose = require('mongoose');

// Define portfolio item schema
const portfolioItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    // You can add more fields as needed
});

// Define portfolio schema
const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
    items: [portfolioItemSchema], // Array of portfolio items
});

// Define model
const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
