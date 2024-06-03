const bcrypt = require("bcrypt");
const User = require("../models/User");
var express = require("express");
var router = express.Router();

// view Profile
router.get("/viewProfile", async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(userId);
        let user = await User.findOne({_id:userId},{password:0});
        console.log(user);
        if (!user || user.isDeleted) return res.status(404).json({msg: "USER DOESN'T EXIST"})
        res.status(200).json({user})
    } catch (error) {
        console.error(error);
    }
})

router.post("/ShowProfile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log(userId);
        let user = await User.findOne({_id:userId},{password:0,notifications:0})
        console.log(user);
        if (!user || user.isDeleted) return res.status(404).json({msg: "USER DOESN'T EXIST"})
        res.status(200).json({user})
    } catch (error) {
        console.error(error);
    }
})

router.get("/getAllProfiles", async (req, res) => {
    try {
        let users = await User.find({utype: {$in :["Freelancer", "Seller"]}, isActive:true, isDeleted:false},
            {_id:1, fullName:1, email:1, utype:1, createdAt:1}
        )
        if (!users) return res.json({message: "NO USERS FOUND"})
        res.json({users})
    } catch (error) {
        console.error(error);
    }
})

//edit Profile
router.post("/editProfile", async (req, res) => {
    try {
        const {email, ...updatedFields} = req.body
        const userId = req.user.userId;
        const utype = req.user.utype;
        let user = await User.findOne({_id:userId})
        if (!user || user.isDeleted) return res.status(404).json({msg: "USER NOT FOUND"})

        // if (req.user.utype == "Freelancer" || req.user.utype == "Seller") {
        //     if (req.user.email != req.body.email) return res.json({msg: "NOT AUTHORIZED"})
        // }

        await User.findByIdAndUpdate(userId, {email:email,updatedBy: req.user.userId, updatedAt: Date.now(), ...updatedFields})
        res.status(200).json({msg: `${utype.toUpperCase()} UPDATED`,  data:{fullName:user.fullName,
            email:user.email,  position:user.position,linkedAccounts:user.linkedAccounts,skillTags:user.skillTags,
            portfolio:user.portfolio , availability:user.availability,description:user.description,
            projects:user.projects, notifications:user.notifications

        }})
    } catch (error) {
        console.error(error)
    }
})

/******* MIDDLEWARE for Super Admin and Admin ********/

router.use((req, res, next) => {
    if (req.user.utype != 'Super Admin' && req.user.utype != 'Admin') return res.json({ msg: "NOT AUTHORIZED" })
    else next()
})

// Approve User
router.post("/approveUser/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        let user = await User.findOne({_id: userId});
        if (!user) return res.status(404).json({ error: "USER NOT FOUND" });
        if (user.isActive) return res.json({msg: "USER ALREADY ACTIVE"});
        await User.findByIdAndUpdate(userId, { isActive: true, activatedBy: req.user.userId, activatedAt: Date.now()});
        res.json({ msg: "USER APPROVED SUCCESSFULLY"});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
  });

// Add Freelancer/Seller
router.post("/addUser", async (req, res) => {
    try{
        const { email, password, utype, ...userData } = req.body
        let user = await User.findOne({email});
        if (user) return res.json ({msg: "User already exists"})
        if (req.body.utype == 'Freelancer' || req.body.utype == 'Seller') {
            await User.create({ ...req.body, password: await bcrypt.hash(password, 5), isActive: true, activatedBy: req.user.userId, activatedAt: Date.now() })
            res.json({ msg: `${utype.toUpperCase()} ADDED` })
        }  
    } catch (error) {
        console.error(error)
    }
})

// Delete Freelancer/Seller
router.post("/deleteUsers/:userIds", async (req, res) => {
    try {
        const userIds = req.params.userIds.split(","); // Assuming user IDs are comma-separated
        const deletedBy = req.user.userId;
        const deletedAt = Date.now();

        // Find and update multiple users in parallel using Promise.all
        const deletePromises = userIds.map(async (userId) => {
            const user = await User.findById(userId);
            if (!user || user.isDeleted) return null;

            if (user.utype === 'Freelancer' || user.utype === 'Seller') {
                return User.findByIdAndUpdate(
                    userId,
                    { isDeleted: true, deletedBy, deletedAt },
                    { new: true } // To return the updated document
                );
            } else {
                return null; // User not eligible for deletion
            }
        });

        const updatedUsers = await Promise.all(deletePromises);

        // Filter out null values (users not found or not eligible for deletion)
        const deletedUsers = updatedUsers.filter((user) => user !== null);

        if (deletedUsers.length > 0) {
            res.json({ msg: `${deletedUsers.length} users deleted`, deletedUsers });
        } else {
            res.json({ msg: "No eligible users found for deletion" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/getInactiveUsers", async (req, res) => {
    try {
        let users = await User.find({isActive:false}, {_id:1, fullName:1, utype:1, createdAt:1})
        if (!users) res.json({msg: "NO INACTIVE USERS"})
        res.json({users})
    } catch (error) {
        console.error(error)
    }
    
})
/******* MIDDLEWARE for Super Admin ONLY ********/

router.use((req, res, next) => {
    if (req.user.utype != 'Super Admin') return res.json({ msg: "NOT AUTHORIZED" })
    else next()
})

// Add Admin
router.post("/addAdmin", async (req, res) => {
    try {
        const {email, password, fullName, utype} = req.body
        let user = await User.findOne({email});
        if (user) return res.json({msg: "ADMIN ALREADY EXISTS"});
        await User.create({ ...req.body, password: await bcrypt.hash(password, 5), isActive: true, activatedBy: req.user.userId, activatedAt: Date.now()});
        res.json({msg: "ADMIN ADDED"});
    } catch (error) {
        console.error(error);
    }
})

// Delete Admin
router.post("/deleteAdmin", async (req, res) => {
    try {
        const {email} = req.body
        let user = await User.findOne({email})
        if (!user || user.isDeleted) return res.json ({msg: "ADMIN NOT FOUND"})
        await User.findByIdAndUpdate(user._id, {isDeleted: true, deletedBy: req.user.userId, deletedAt: Date.now()} )
        res.json({msg: "ADMIN DELETED"})
    } catch (error) {
        console.error(error);
    }
})
module.exports = router