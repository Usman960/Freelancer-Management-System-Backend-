const express = require("express");
const router = express.Router();
const project = require("../models/Project");
const user = require("../models/User");

// add a project
router.post("/seller/projects", async (req, res) => {
  try {
    const {
      sellerId,
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType,
      skillTags,
    } = req.body;

    const seller = await user.findOne({ _id: sellerId, utype: "Seller" });
    if (!seller) {
      return res.status(400).json({ error: "Invalid seller ID" });
    }

    await project.create({
      sellerId,
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType,
      skillTags,
    });

    console.log("Project created successfully");

    res.json({ msg: "Project created successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update a project
router.put("/seller/projects/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    console.log(projectId);
    const {
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType,
      skillTags,
    } = req.body;

    // Create an object to store the fields to be updated
    const updatedFields = {};
    if (projectName) updatedFields.projectName = projectName;
    if (projectDescription)
      updatedFields.projectDescription = projectDescription;
    if (projectLength) updatedFields.projectLength = projectLength;
    if (skillLevel) updatedFields.skillLevel = skillLevel;
    if (price) updatedFields.price = price;
    if (projectType) updatedFields.projectType = projectType;
    if (skillTags) updatedFields.skillTags = skillTags;

    const updatedProject = await project.findByIdAndUpdate(
      projectId,
      updatedFields,
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({
      message: "Project updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// fetch by projectId
router.get("/seller/projects/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const projectInfo = await project.findById(projectId);

    if (!projectInfo) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(projectInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete project
router.delete("/seller/projects/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const deletedProject = await project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/projects/:projectId/bids", async (req, res) => {
//   try {
//     const projectId = req.params.projectId;
//     // Fetch bids associated with the project ID
//     const projectBids = await project
//       .findById(projectId)
//       .select("bids")
//       .populate("bids");

//     res.json(projectBids.bids);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

module.exports = router;
