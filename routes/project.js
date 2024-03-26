const Users = require("../models/User");
const Projects = require("../models/Project");
var express = require("express");
var router = express.Router();
// const jwt = require("jsonwebtoken")



router.get("/ShowProjects", async (req, res) => {
    try {
       const page = req.query.page || 0; 
       const ProjPerPage = 3;
       const Allprojects =  await Projects.find().skip(page * ProjPerPage).limit(ProjPerPage);

         res.json({data: Allprojects })
    }catch (error) {
        console.error(error)
    
}}
);
router.get("/SearchProjects", async (req, res) => {
  try {
     const page = req.query.page || 0; 
     const ProjPerPage = 5;

     if (!req.body.Search) {

      const allProjects = await Projects.find({}).skip(page * ProjPerPage).limit(ProjPerPage);
      
      return res.json({ data: allProjects });
    }
     const Search  = new RegExp(req.body.Search, 'i');
     
     const Allprojects =  await Projects.find({
        $or: [
            { skillLevel: Search },
            { projectType: Search },
            { projectName:Search },
            { skillTags: Search },
            { status: Search }
           
        ]
    }).skip(page * ProjPerPage).limit(ProjPerPage);

       res.json({ data: Allprojects })
  } catch (error) {
      console.error(error);
    
  }
});
router.get("/filterProjects", async (req, res) => {
  try {
    const page = req.query.page || 0;
    const ProjPerPage = 5;
    const { rating, price, projectType, skillLevel, projectLength, skillTags, priceGreaterThan, priceLessThan } = req.query;

    const filter = {};

    if (rating) {
      filter.rating = rating;
    }
    if (price) {
      filter.price =  price ;
    }

    if (priceGreaterThan) {
      filter.price = { $gt: priceGreaterThan };
    }
    if (priceLessThan) {
      filter.price = { $lt: priceLessThan };
    }
    if (projectType) {
      filter.projectType = projectType;
    }
    if (skillLevel) {
      filter.skillLevel = skillLevel;
    }
    if (projectLength) {
      filter.projectLength = projectLength;
    }
    if (skillTags) {
      filter.skillTags = skillTags;
    }

    const projects = await Projects.find(filter)
      .skip(page * ProjPerPage)
      .limit(ProjPerPage);

    res.json({ data: projects });
  } catch (error) {
    console.error(error);
  }
});


router.get("/ShowProjectbyId", async (req, res) => {
  try {
      let Projectid = req.body.ProjectId;
      const Project = await Projects.findOne({ _id: Projectid });
      if (Project.length == 0) return res.json({ msg: "Project not Found" })

       res.json({data: Project})
  }catch (error) {
      console.error(error)
  
}}
);
router.post("/Projectbid", async (req, res) => {
  try {
      const projectid = req.body.ProjectId;
      const newbid = req.body.bids;
      const freelancerId = req.body.freelancerId;

     const existingbid =  await Projects.findOne({_id:projectid,"bids.freelancerId": freelancerId});
     if (existingbid){
     return res.status(400).json({error:"You already have a bid on this project!"})
     }
       await Projects.findOneAndUpdate({_id:projectid}, { $push:{bids:newbid} });

       res.json({data: newbid})
  }catch (error) {
      console.error(error)
  
}}
);
router.post("/ShowMyBids", async (req, res) => {
  try {
     const freelancerID = req.body.freelancerId;
     const Allbids =  await Projects.find({"bids.freelancerId": freelancerID},{projectName:1,_id:0,"bids.$":1});
     
     if(Allbids.length==0){
      return res.json({error:"You have no bids at the moment"});
     }

       res.json({data: Allbids})
  }catch (error) {
      console.error(error)
  
}}
);
router.post("/EditMyBid", async (req, res) => {
  try {
     const ProjectID = req.body.Projectid;
     const freelancerID = req.body.freelancerID;
     const { bidAmount,message } = req.body;
     console.log(bidAmount);
     console.log(ProjectID);
     const project =  await Projects.findOne({_id:ProjectID,"bids.freelancerId": freelancerID});
     if (!project) {
      return res.status(404).json({ error: "No project found" });
  }
     const index = project.bids.findIndex(bids => bids.freelancerId.toString() === freelancerID);
    
     if (index === -1) {
      return res.status(404).json({ error: "You have no bids on this project!" });
  }

 
  if (bidAmount !== undefined) {
  project.bids[index].bidAmount = bidAmount;
  }
  if (message !== undefined) {
  project.bids[index].message = message;
  }

 
  await project.save();
     
       res.json({message: " Bid Edited Successfully" })
  }catch (error) {
      console.error(error)
  
}}
);

router.post("/WithdrawBid", async (req, res) => {
  try {
     const ProjectID = req.body.Projectid;
     const freelancerID = req.body.freelancerID;
    
     const project =  await Projects.findOne({_id:ProjectID,"bids.freelancerId": freelancerID});
     
     if (!project) {
      return res.status(404).json({ error: "No Bid found" });
  }
     const index = project.bids.findIndex(bids => bids.freelancerId.toString() === freelancerID);
    
     if (index === -1) {
      return res.status(404).json({ error: "You have no bids on this project!" });
  }

   
project.bids.splice(index, 1);
await project.save();
     
       res.json({message: " Bid Removed Successfully" })
  }catch (error) {
      console.error(error)
  
}}
);


router.post("/ShowBidsbyProject", async (req, res) => {
  try {
     const ProjectID = req.body.Projectid;
     const project = await Projects.findOne({_id: ProjectID});
     if (!project) {
      return res.status(404).json({ error: "No project found" });
  }  
      
       res.json( {data : project.bids})
  }catch (error) {
      console.error(error);
  
}}
);

router.post("/HireFreelancer", async (req, res) => {
  try {
    const ProjectID = req.body.Projectid;
    const freelancerID = req.body.freelancerID;
    const project =  await Projects.findOne({_id:ProjectID});
    if (!project) {
     return res.status(404).json({ error: "No project found" });
 }  
   project.freelancerId = freelancerID;
   project.status = "pending";
   const projectName = project.projectName;

    const notificationMessage = `You have been hired for the project '${projectName}'.`
    
    await Users.findOneAndUpdate({_id:freelancerID},{ $push: { notifications: { message: notificationMessage } } })
  
   await project.save();

 

       res.json({ message: "Freelancer Hired", "Project status": project.status})
  }catch (error) {
      console.error(error)
  
}}
);


module.exports = router