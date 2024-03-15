const mongoose = require('mongoose');

// Define bid schema
const bidSchema = new mongoose.Schema({
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    bidAmount: { type: Number, required: true },
    message: { type: String }, // proposal of the freelancer
    createdAt: { type: Date, default: Date.now }
});

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;