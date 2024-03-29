const mongoose = require("mongoose");

// Define project schema
const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the freelancer
  datePosted: { type: Date, default: Date.now },
  projectDescription: { type: String, required: true },
  projectLength: {
    type: String,
    enum: ["< 1 month", "1-3 months", "> 3 months"],
    required: true,
  },
  skillLevel: {
    type: String,
    enum: ["Entry Level", "Intermediate", "Expert"],
    required: true,
  },
  price: { type: Number, required: true }, // can be hourly or fixed
  projectType: {
    type: [String],
    enum: ["Fixed Price", "Hourly"],
    required: true,
  },
  skillTags: [String],
  status: {
    type: String,
    enum: ["notHired", "pending", "completed"],
    default: "notHired",
  },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  isDeleted:{type: Boolean, default:false},
  Deletedby:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  Updatedby:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"},

  DeletedAt:{type:Date},
  UpdatedAt:{type:Date},
  bids: [
    {
      freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      bidAmount: { type: Number, required: true },
      message: { type: String }, // proposal of the freelancer
      createdAt: { type: Date, default: Date.now },
      Updatedby:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"},
      UpdatedAt:{type:Date}
    },
  ],
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
