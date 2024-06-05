const express = require("express");
const router = express.Router();
const project = require("../models/Project");
const user = require("../models/User");

// add a project
router.post("/seller/addproject", async (req, res) => {
  try {
    const {
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType
      // skillTags,
    } = req.body;
   const sellerId = req.user.userId;
    const seller = await user.findOne({ _id: sellerId, utype: "Seller" });
    if (!seller) {
      return res.status(400).json({ error: "Please Log in as a Seller" });
    }
    await project.create({
      sellerId,
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType
      // skillTags
    });


    res.json({ msg: "Project created successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update a project
router.put("/seller/Updateprojects/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const {
      projectName,
      projectDescription,
      projectLength,
      skillLevel,
      price,
      projectType,
      skillTags,
      status
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
    if (status) updatedFields.status = status;

    const updatedProject = await project.findByIdAndUpdate(
      projectId,
      updatedFields,
      { new: true }
    );

    if (!updatedProject || updatedProject.isDeleted == true) {
      return res.status(404).json({ error: "Project not found" });
    }
    updatedProject.Updatedby = req.user.userId;
    updatedProject.UpdatedAt = new Date();
    await updatedProject.save();

    res.json({
      msg: "Project Updated successfully",
      data:updatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




router.post("/seller/DeleteProject/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const deletedProject = await project.findById(projectId);

    if (!deletedProject || deletedProject.isDeleted == true) {
      return res.status(404).json({ error: "Project not found" });
    }
   deletedProject.isDeleted = true;
   deletedProject.Deletedby = req.user.userId;
   deletedProject.DeletedAt = new Date();
   await deletedProject.save();

    res.json({ msg: "Project deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
