const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    type: { type: String, enum: ['Super Admin', 'Admin', 'Freelancer', 'Seller'], required: true },
    linkedAccounts: [String],
    skillTags: [String],
    portfolio:[{
        title: { type: String, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String, required: true },
        // You can add more fields as needed for each portfolio item
    }],
    availability: { type: String, enum: ['Online', 'Offline']},
    description: { type: String },
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }
    ],
    category: String, // eg., data science, web dev, graphic design etc.
    position: String, // job title
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;