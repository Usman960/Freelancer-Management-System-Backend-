const bcrypt = require("bcrypt");
const User = require("../models/User");
var express = require("express");
var router = express.Router();

// view Profile
router.get("/viewProfile", async (req, res) => {
    try {
        const {email} = req.body
        let user = await User.findOne({email})
        if (!user) return res.json({msg: "USER DOESN'T EXIST"})
        res.json({user})
    } catch (error) {
        console.error(error);
    }
})

//edit Profile
router.post("/editProfile", async (req, res) => {
    try {
        const {email, utype, ...updatedFields} = req.body
        let user = await User.findOne({email})
        if (!user) return res.json({msg: "USER NOT FOUND"}) 
        Object.assign(user, updatedFields)
        await user.save();
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

// Add Freelancer/Seller
router.post("/addUser", async (req, res) => {
    try{
        const { email, password, utype, ...userData } = req.body
        let user = await User.findOne({email});
        if (user) return res.json ({msg: "User already exists"})
        if (req.body.utype == 'Freelancer' || req.body.utype == 'Seller') {
            await User.create({ ...req.body, password: await bcrypt.hash(password, 5) })
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
        if (!user) return res.json ({msg: "USER NOT FOUND"})
        if (user.utype == 'Freelancer' || user.utype == 'Seller') {
            await User.deleteOne({email: req.body.email});
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
        await User.create({ ...req.body, password: await bcrypt.hash(password, 5)});
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
        if (!user) return res.json ({msg: "ADMIN NOT FOUND"})
        await User.deleteOne({email: req.body.email})
        res.json({msg: "ADMIN DELETED"})
    } catch (error) {
        console.error(error);
    }
})
module.exports = router