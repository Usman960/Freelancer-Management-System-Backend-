const Users = require("../models/User");
const Projects = require("../models/Project");
var express = require("express");
var router = express.Router();
// const jwt = require("jsonwebtoken")



router.get("/ShowProjects", async (req, res) => {
    try {
       const page = req.query.page || 1; 
       const ProjPerPage = 4;
       const Allprojects =  await Projects.find({isDeleted:false},{isDeleted:0}).populate({
        path:'sellerId',select: '-_id fullName description'}).skip(page-1 * ProjPerPage).limit(ProjPerPage);

         res.status(200).json({data: Allprojects })
    }catch (error) {
        console.error(error)
    
}}
);


router.get("/ShowMyProjects/:status", async (req, res) => {
  try {
    const page = req.query.page || 1; 
    const ProjPerPage = 4;
    const status = req.params.status || "notHired";
    const userId = req.user.userId;
     const Allprojects =  await Projects.find({isDeleted:false,sellerId:userId,status:status},{isDeleted:0}).populate({
      path:'sellerId',select: '_id fullName description'}).populate({
        path:'freelancerId',select: '_id fullName description'}).skip((page -1)* ProjPerPage).limit(ProjPerPage);
      res.status(200).json({data: Allprojects })
  }catch (error) {
      console.error(error)
  
}}
);


router.post("/SearchProjects", async (req, res) => {
  try {
     const page = req.query.page || 1; 
     const ProjPerPage = 4;
     if (!req.body.Search) {

      const allProjects = await Projects.find({isDeleted:false,status:'notHired'},{isDeleted:0}).populate({
        path:'sellerId',select: '_id fullName description'}).skip((page-1) * ProjPerPage).limit(ProjPerPage);

      
      return res.status(200).json({ data: allProjects });
    }
     const Search  = new RegExp(req.body.Search, 'i');
     
     const Allprojects =  await Projects.find({
        $or: [
            { skillLevel: Search },
            { projectType: Search },
            { projectName: Search },
            { skillTags: Search },
            { status: Search }
           
        ],isDeleted:false,status:'notHired'
    },{_id:0,isDeleted:0}).populate({
      path:'sellerId',select: '_id fullName description'}).skip((page-1) * ProjPerPage).limit(ProjPerPage);

       res.status(200).json({ data: Allprojects })
  } catch (error) {
      console.error(error);
    
  }
});

// router.get("/filterProjects", async (req, res) => {
//   try {
//     const page = req.query.page || 1;
//     const ProjPerPage = 4;
//     const { rating, price, projectType, skillLevel, projectLength, skillTags, priceGreaterThan, priceLessThan } = req.query;

//     const filter = {};

//     if (rating) {
//       filter.rating = rating;
//     }
//     if (price) {
//       filter.price =  price ;
//     }

//     if (priceGreaterThan) {
//       filter.price = { $gt: priceGreaterThan };
//     }
//     if (priceLessThan) {
//       filter.price = { $lt: priceLessThan };
//     }
//     if (projectType) {
//       filter.projectType = projectType;
//     }
//     if (skillLevel) {
//       filter.skillLevel = skillLevel;
//     }
//     if (projectLength) {
//       filter.projectLength = projectLength;
//     }
//     if (skillTags) {
//       filter.skillTags = skillTags;
//     }

//     filter.isDeleted = false;

//     const projects = await Projects.find(filter,{_id:0,isDeleted:false}).populate({
//       path:'sellerId',select: '-_id fullName description'}).skip((page-1) * ProjPerPage).limit(ProjPerPage);

//     res.status(200).json({ data: projects });
//   } catch (error) {
//     console.error(error);
//   }
// });


router.get("/ShowProjectbyId", async (req, res) => {
  try {
      let Projectid = req.body.ProjectId;
      const Project = await Projects.findOne({ _id: Projectid ,isDeleted:false},{isDeleted:0,_id:0});
      if (!Project || Project.isDeleted == true) return res.status(404).json({ msg: "Project not Found" });
      

       res.status(200).json({data: Project})
  }catch (error) {
      console.error(error)
  
}}
);

router.post("/Projectbid", async (req, res) => {
  try {
      const {projectId,message,bidAmount} = req.body;  
      const freelancerId = req.user.userId;
         let newbid = { 
      bidAmount,
      message,
      freelancerId
  };
      const project = await Projects.findOne({_id:projectId, isDeleted: false});

      if (!project) {
        return res.status(404).json({ msg: "Project not found!" });
      }

      const existingbid =  await Projects.findOne({_id:projectId,"bids.freelancerId": freelancerId,isDeleted:false});
      if (existingbid){
        return res.status(400).json({msg:"You already have a bid on this project!"})
      }
      

      const sellerId = project.sellerId
      const projectName = project.projectName
      await Projects.findOneAndUpdate({_id:projectId}, { $push:{bids:newbid} });
      
      const notificationMessage = `You received a new bid for the project '${projectName}'.`
    
      await Users.findOneAndUpdate({_id:sellerId},{ $push: { notifications: { message: notificationMessage ,ntype:'Message',projectId:projectId} } })

       res.status(200).json({msg:"Bid Added Successfully",data: newbid})
  } catch (error) {
      console.error(error)
  
    }
}
);

router.get("/ShowMyBids", async (req, res) => {
  try {
    const page = req.query.page || 1; 
     const ProjPerPage = 4;
     const freelancerID = req.user.userId;
     const Allbids =  await Projects.find({"bids.freelancerId": freelancerID,status:'notHired',isDeleted :false},{projectName:1,"bids.$":1}
     ).skip((page-1) * ProjPerPage).limit(ProjPerPage);
     
     if(Allbids.length==0){
      return res.status(404).json({msg:"You have no bids at the moment"});
     }

       res.status(200).json({data: Allbids})
  }catch (error) {
      console.error(error)
  
}}
);

router.get("/Showmyongoingproj/:type", async (req, res) => {
  try {
    const page = req.query.page || 1; 
    const ProjPerPage = 4;
     const freelancerID = req.user.userId;
    
     const type = req.params.type ;
     const Allproj =  await Projects.find({status:type,freelancerId: freelancerID,isDeleted :false},{bids:0})
     .populate({
      path:'sellerId',select: '-_id fullName description'}).skip((page-1) * ProjPerPage).limit(ProjPerPage);

     
     if(!Allproj || Allproj.length==0){
      return res.status(200).json({data:[],msg:"You have no Ongoing/Completed Projects at the moment"});
     }

       res.status(200).json({data: Allproj})
  }catch (error) {
      console.error(error)
  
}}
);




router.post("/EditMyBid", async (req, res) => {
  try {
     const ProjectID = req.body.ProjectId;
     const freelancerID = req.user.userId;
     const { bidAmount,message } = req.body;
     const project =  await Projects.findOne({_id:ProjectID,"bids.freelancerId": freelancerID,isDeleted : false});
     
     if (!project) {
      return res.status(404).json({ msg: "No project found" });
  }
     const index = project.bids.findIndex(bids => bids.freelancerId.toString() === freelancerID);
     
     if (index === -1) {
      return res.status(404).json({ msg: "You have no bids on this project!" });
  }

 
  if (bidAmount !== undefined) {
  project.bids[index].bidAmount = bidAmount;
  }
  if (message !== undefined) {
  project.bids[index].message = message;
  }

  project.bids[index].UpdatedAt = new Date();
  project.bids[index].Updatedby = req.user.userId;
  await project.save();
     
       res.status(200).json({msg: "Bid Edited Successfully" })
  }catch (error) {
      console.error(error)
  
}}
);

router.post("/WithdrawBid", async (req, res) => {
  try {
     const ProjectID = req.body.ProjectId;
     const freelancerID = req.user.userId;
     
    
     const project =  await Projects.findOne({_id:ProjectID,"bids.freelancerId": freelancerID,isDeleted:false});
     
     if (!project) {
      return res.status(404).json({ error: "No Bid found" });
  }
     const index = project.bids.findIndex(bids => bids.freelancerId.toString() === freelancerID);
    
     if (index === -1) {
      return res.status(404).json({ error: "You have no bids on this project!" });
  }

   
project.bids.splice(index, 1);
await project.save();
     
       res.status(200).json({msg: "Bid Removed Successfully" })
  }catch (error) {
      console.error(error)
  
}}
);

router.post("/Reviewrequest", async (req, res) => {
  try {
    const ProjectID = req.body.ProjectId;
    const freelancerID = req.user.userId;
    
    const project =  await Projects.findOne({_id:ProjectID,freelancerId:freelancerID,isDeleted:false}).populate({
      path:'freelancerId',select: '_id fullName'});
    if (!project) {
     return res.status(404).json({ error: "No project found" });

 }  

   const projectName = project.projectName;
   const SellerId = project.sellerId;
   const freelancerName = project.freelancerId.fullName;
   

    const notificationMessage = `Review Request for '${projectName}' by '${freelancerName}'.`;
    
    await Users.findOneAndUpdate({_id:SellerId},{ $push: { notifications: { message: notificationMessage ,ntype:'Request',ProjectId:ProjectID,freelancerId:freelancerID} } });
  
   await project.save();

 

       res.status(200).json({ msg: "Review Request Sent to Seller"});
  }catch (error) {
      console.error(error)
  
}}
);

//Seller
router.get("/ShowBidsbyProject/:ProjectId", async (req, res) => {
  try {
    const page = req.query.page || 1; 
    const ProjPerPage = 4;
     const ProjectID = req.params.ProjectId;
     const project = await Projects.findOne({_id: ProjectID,isDeleted:false}).populate(
      {path:'bids.freelancerId',select: '_id fullName email'}).skip((page-1) * ProjPerPage).limit(ProjPerPage);
     if (!project) {
      return res.status(404).json({ error: "No project found" });
  }  
      
       res.status(200).json( {data : project.bids})
  }catch (error) {
      console.error(error);
  
}}
);

router.post("/HireFreelancer", async (req, res) => {
  try {
    const ProjectID = req.body.ProjectId;
    const freelancerID = req.body.freelancerId;
    const project =  await Projects.findOne({_id:ProjectID,isDeleted:false});
    if (!project) {
     return res.status(404).json({ error: "No project found" });

 }  

   project.freelancerId = freelancerID;
   project.status = "pending";
   const projectName = project.projectName;

    const notificationMessage = `You have been hired for the project '${projectName}'.`
    
    await Users.findOneAndUpdate({_id:freelancerID},{ $push: { notifications: { message: notificationMessage,ntype:'Message' } } })
  
   await project.save();

 

       res.status(200).json({ msg: "Freelancer Hired", "Project status": project.status})
  }catch (error) {
      console.error(error)
  
}}
);

router.post("/Markcompleted", async (req, res) => {
  try {
      let Projectid = req.body.ProjectId;
      const Project = await Projects.findOne({ _id: Projectid ,isDeleted:false},{isDeleted:0});
      if (!Project || Project.isDeleted == true) return res.status(404).json({ msg: "Project not Found" });
      
     Project.status = 'completed';

     await Project.save();
       res.status(200).json({msg:"Project has been marked Completed"})
  }catch (error) {
      console.error(error)
  
}}
);

router.get("/ShowReviewRequests", async (req, res) => {
  try {
      let SellerID = req.user.userId;
      const user = await Users.findOne({ _id: SellerID,isDeleted:false},
      {isDeleted:0}).populate(
      {path:'notifications.ProjectId',select: '_id projectName status'}).
      populate(
        {path:'notifications.freelancerId',select: '_id fullName'});
        console.log(user)
        notifications = user.notifications.filter(noti=>noti.ntype==='Request'&& noti.ProjectId.status=== 'pending')
      
       res.status(200).json({data:notifications})
  }catch (error) {
      console.error(error)
  
}}
);

router.get("/GetPendingProjects/:status", async (req, res) => {
  try {
      let userID = req.user.userId;
      const status = req.params.status;
      const count = await Projects.find({ $or:[{sellerId: userID},{freelancerId:userID}],isDeleted:false,status:status}).countDocuments()

      if (!count || count == 0){
       return  res.status(200).json({count:0})
      }

      
       res.status(200).json({count:count})
  }catch (error) {
      console.error(error)
  
}}
);

router.get("/getTotalSales", async (req, res) => {
  try {
    const userType = req.user.utype;
    const userId = req.user.userId;

    let totalSales = 0;

    if (userType === "Super Admin" || userType === "Admin") {
      // Fetch all completed projects
      const completedProjects = await Projects.find({ status: "completed" }).populate('bids.freelancerId');

      // Sum the bids of hired freelancers
      completedProjects.forEach(project => {
        if (project.freelancerId) {
          project.bids.forEach(bid => {
            if (bid.freelancerId.equals(project.freelancerId)) {
              totalSales += bid.bidAmount;
            }
          });
        }
      });

    } else if (userType === "Freelancer") {
      // Fetch all completed projects for the freelancer
      const freelancerProjects = await Projects.find({
        status: "completed",
        freelancerId: userId
      }).populate('bids.freelancerId');

      // Sum the bids of the freelancer
      freelancerProjects.forEach(project => {
        project.bids.forEach(bid => {
          if (bid.freelancerId.equals(userId)) {
            totalSales += bid.bidAmount;
          }
        });
      });

    } else if (userType === "Seller") {
      // Fetch all completed projects for the seller
      const sellerProjects = await Projects.find({
        status: "completed",
        sellerId: userId
      }).populate('bids.freelancerId');

      // Sum the prices of the completed projects
      // sellerProjects.forEach(project => {
      //   totalSales += project.price;
      // });
      // Sum the bids of the freelancer
      sellerProjects.forEach(project => {
        project.bids.forEach(bid => {
          if (bid.freelancerId.equals(project.freelancerId)) {
            totalSales += bid.bidAmount;
          }
        });
      });

    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({ totalSales });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/totalProjects", async (req, res) => {
  try {
    const count = await Projects.find({status: "completed", isDeleted: false}).countDocuments();
    res.json({count});
  } catch (error) {
    console.error(error);
  }
})

module.exports = router