const express = require("express");
const router = express.Router();
const Project = require("../models/Project");

// Endpoint to get project ratings and reviews of
router.get("/project-ratings-reviews", async (req, res) => {
  try {
    const projectsWithRatingsReviews = await Project.find({
      rating: { $exists: true },
      review: { $exists: true },
    }).populate("sellerId", "username");

    res.json(projectsWithRatingsReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get average rating of a freelancer
router.get("/freelancer-average-rating/:freelancerId", async (req, res) => {
  try {
    const freelancerId = req.body.freelancerId;

    // Find all projects associated with the freelancer
    const projects = await Project.find({ freelancerId: freelancerId });

    // Filter projects that have ratings
    const ratedProjects = projects.filter((project) => project.rating);

    // Calculate the average rating
    let totalRating = 0;
    for (const project of ratedProjects) {
      totalRating += project.rating;
    }
    const averageRating =
      ratedProjects.length > 0 ? totalRating / ratedProjects.length : 0;

    res.json({ averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
