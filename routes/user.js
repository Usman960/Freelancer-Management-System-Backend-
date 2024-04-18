const bcrypt = require("bcrypt");
const User = require("../models/User");
var express = require("express");
var router = express.Router();

// view Profile
router.get("/viewProfile", async (req, res) => {
    try {
        const {email} = req.body
        let user = await User.findOne({email})
        if (!user || user.isDeleted) return res.json({msg: "USER DOESN'T EXIST"})
        res.json({user})
    } catch (error) {
        console.error(error);
    }
})

//edit Profile
router.post("/editProfile", async (req, res) => {
    try {
        const {email, utype, ...updatedFields} = req.body
        const userId = req.user.userId;
        let user = await User.findOne({_id:userId})
        if (!user || user.isDeleted) return res.json({msg: "USER NOT FOUND"})
        console.log(user)

        // if (req.user.utype == "Freelancer" || req.user.utype == "Seller") {
        //     if (req.user.email != req.body.email) return res.json({msg: "NOT AUTHORIZED"})
        // }

        await User.findByIdAndUpdate(user._id, {updatedBy: req.user.userId, updatedAt: Date.now(), ...updatedFields})
        res.json({msg: `${utype.toUpperCase()} UPDATED`, data: user})
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
router.post("/deleteUser", async (req, res) => {
    try {
        const {email} = req.body
        let user = await User.findOne({email});
        if (!user || user.isDeleted) return res.json ({msg: "USER NOT FOUND"})
        if (user.utype == 'Freelancer' || user.utype == 'Seller') {
            await User.findByIdAndUpdate(user._id, {isDeleted: true, deletedBy: req.user.userId, deletedAt: Date.now()} )
            res.json ({msg: `${user.utype.toUpperCase()} DELETED`});
        }
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