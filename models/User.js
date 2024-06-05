const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    utype: { type: String, enum: ['Super Admin', 'Admin', 'Freelancer', 'Seller'], required: true },
    linkedAccounts: [String],
    skillTags: [String],
    availability: { type: String, enum: ['Online', 'Offline']},
    description: { type: String },
    projects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project'
        }
    ],
    position: String, // job title
    createdAt: { type: Date, default: Date.now },
    notifications: [
        {
            message: { type: String, required: true }, // Notification message
            createdAt: { type: Date, default: Date.now }, // Notification creation date
            cancelled: {type: Boolean, default: false},
            ntype:{type:String,enum:['Request','Message']},
            ProjectId:  {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Project'
            },
            freelancerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    isActive: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    deletedAt: {type: Date},
    activatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    activatedAt: {type: Date},
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    updatedAt: {type: Date}
});

const User = mongoose.model('User', userSchema);

module.exports = User;