const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const projectManagementRouter = require("./projectManagement");
const ratingRouter = require("./rating");
const communicationRouter = require("./communication");
const authRouter = require("./auth");
const userRouter = require("./user");

router.use("/auth", authRouter);

/******* above are all the routes that WILL NOT pass through the middleware ********/

// router.use(async (req, res, next) => {x
//   try {
//     const token = req.headers.authorization;
//     const user = jwt.verify(token.split(" ")[1], "MY_SECRET");
//     req.user = user;
//     next();
//   } catch (e) {
//     return res.json({ msg: "TOKEN NOT FOUND / INVALID" });
//   }
// });

/******* below are all the routes that WILL pass through the middleware ********/

router.use("/projectManagement", projectManagementRouter);
router.use("/rating", ratingRouter);
router.use("/communication", communicationRouter);
// router.use("/project", projectRouter);
// router.use("/projectManagement", projectManagementRouter);
// router.use("/projectTracking", projectTrackingRouter);
// router.use("/rating", ratingRouter);
// router.use("/communication", communicationRouter);
router.use("/user", userRouter);
module.exports = router;
