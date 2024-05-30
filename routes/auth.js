const bcrypt = require("bcrypt");
const User = require("../models/User");
var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken")
const helpers = require("../utils/helper")

// Sign Up
router.post("/signup", async (req, res) => {
    try {
        const { email, password, utype, ...userData } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.json({ msg: "USER ALREADY EXISTS" });
        if (utype !== 'Freelancer' && utype !== 'Seller') {
            return res.json({ msg: "INVALID USER TYPE" });
        }

        const hashedPassword = await bcrypt.hash(password, 5);
        const newUser = await User.create({
            email,
            password: hashedPassword,
            utype,
            ...userData
        });

        const admins = await User.find({ utype: { $in: ["Super Admin", "Admin"] } });
        const notificationMsg = `Request to add user ${newUser._id}`;

        for (const admin of admins) {
            await User.findByIdAndUpdate(admin._id, {
                $push: { notifications: { message: notificationMsg } }
            });
        }

        res.json({ msg: `${utype.toUpperCase()} ADDED` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});


// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user || user.isDeleted) return res.json({ msg: "USER NOT FOUND" })
        console.log( user);
       console.log( user.isActive);

        if (!user.isActive) return res.json({msg: "USER INACTIVE"});
        
        const passwordCheck = await bcrypt.compare(password, user.password);
        if (!passwordCheck) return res.json({ msg: "WRONG PASSWORD" })

        const token = jwt.sign({
            email,
            createdAt: new Date(),
            userId:user._id,
            utype: user.utype,
            userId: user._id
        }, "MY_SECRET", { expiresIn: "1d" });

        res.json({
            msg: "LOGGED IN", token ,email:user.email

            }
        )
    } catch (error) {
        console.error(error)
    }
});

//changePassword
router.post("/changePassword", async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.json ({msg: "TOKEN NOT FOUND"})

        const user = jwt.verify(token.split(" ")[1], "MY_SECRET");
        const { email, password, confirmPassword } = req.body;

        if (password != confirmPassword) return res.json({ msg: "PASSWORD MISMATCH" });
        
        // Check if the email in the token matches the email in the request body
        if (user.email !== email) {
            return res.json({ msg: "INVALID TOKEN FOR THIS EMAIL" });
        }

        await User.findOneAndUpdate({ email }, { password: await bcrypt.hash(password, 5) });
        
        res.json({ msg: "PASSWORD CHANGED" });
    } catch (error) {
        console.error(error);
    }
});

// forgetPassword
router.post("/forgetPassword", async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.json({msg: "INVALID EMAIL ADDRESS"})
        if (user) {
            const newPassword = helpers.generateAlphanumericPassword();
            await user.updateOne({ password: await bcrypt.hash(newPassword, 5) })
            await helpers.transporter.sendMail({
                from: 'mu943498@gmail.com',
                to: user.email,
                subject: "Password Reset",
                text: `Dear ${user.fullName}, your new password is: ${newPassword}`
            });
            res.json({msg: "SUCCESS"})
        }
    } catch (error) {
        console.error(error);
    }
})

module.exports = router