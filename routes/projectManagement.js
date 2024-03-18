const express = require("express");
const router = express.Router();
const project = require("../models/Project");
const user = require("../models/User");

router.post("/seller/projects", async (req, res) => {
  try {
    const {
      userId,
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType,
      skillTags,
    } = req.body;

    await project.create({
      userId,
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType,
      skillTags,
    });

    res.json({ msg: "contract created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/seller/projects", async (req, res) => {
  try {
    // Pagination , elastic and other search parameters left
    //  Search by project name
    const projectName = req.query.projectName;
    const projects = await project.find({ projectName: projectName });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/projects/:projectId/bids", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    // Fetch bids associated with the project ID
    const projectBids = await project
      .findById(projectId)
      .select("bids")
      .populate("bids");

    res.json(projectBids.bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/freelancers/:freelancerId/profile", async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;
    // Fetch freelancer profile based on freelancer ID
    const freelancerProfile = await user.findOne({
      _id: freelancerId,
      type: "Freelancer",
    });

    // Check if a freelancer with the given ID exists
    if (!freelancerProfile) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    res.json(freelancerProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/hire-freelancer", async (req, res) => {
  try {
    const { projectId, freelancerId } = req.body;

    // Retrieve the project by its ID
    const foundProject = await project.findById(projectId);
    if (!foundProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Retrieve the freelancer by their ID
    const foundFreelancer = await freelancer.findById(freelancerId);
    if (!foundFreelancer) {
      return res.status(404).json({ error: "Freelancer not found" });
    }

    // Update the project status to indicate it has been assigned to the freelancer
    foundProject.status = "pending";
    foundProject.freelancerId = foundFreelancer._id; // Assign the freelancer to the project
    await foundProject.save();

    res.json({ msg: "Freelancer hired successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
