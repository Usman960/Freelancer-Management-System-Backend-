const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    type: { type: String, enum: ['Super Admin', 'Admin', 'Freelancer', 'Seller'], required: true },
    linkedAccounts: [String],
    skillTags: [String],
    portfolio: [portfolioItemSchema],
    availability: { type: String, enum: ['Online', 'Offline'], required: true },
    description: { type: String, required: true },
    projects: [projectSchema],
    category: String, // eg., data science, web dev, graphic design etc.
    position: String, // job title
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

model.export = User;