const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// Endpoint to get project ratings and reviews of
router.get("/project-ratings-reviews", async (req, res) => {
  try {
    const projectsWithRatingsReviews = await Project.find({
      rating: { $exists: true },
      review: { $exists: true },
      isDeleted:false
    }).populate("sellerId", "username");

    res.json(projectsWithRatingsReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/GiveRatingReview", async (req, res) => {
  try {
    const projectId = req.body.ProjectId;
    const sellerId = req.user.userId;
    const Review = req.body.review;
    const Rating = req.body.rating;
    const project = await Project.findOne({_id:projectId,sellerId:sellerId,isDeleted:false}).populate("sellerId", "username");


    project.rating = Rating;
    project.review = Review;

    await project.save();
    res.json({msg:"Rating and Review Added"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Endpoint to get average rating of a freelancer
router.get("/freelancer-average-rating", async (req, res) => {
  try {
    const freelancerId = req.user.userId;

    // Find all projects associated with the freelancer
    const projects = await Project.find({ freelancerId: freelancerId,status:'completed' });

    // Filter projects that have ratings
    const ratedProjects = projects.filter((project) => project.rating);

    // Calculate the average rating
    let totalRating = 0;
    for (const project of ratedProjects) {
      totalRating += project.rating;
    }
    const averageRating =
      ratedProjects.length > 0 ? totalRating / ratedProjects.length : 0;

      let roundedRating = averageRating.toFixed(1);
    res.json({ averageRating:roundedRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
