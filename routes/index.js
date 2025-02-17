const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const projectRouter = require('./project');
const projectManagementRouter = require("./projectManagement");
const ratingRouter = require("./rating");
const authRouter = require("./auth");
const userRouter = require("./user");

router.use("/auth", authRouter);

/******* above are all the routes that WILL NOT pass through the middleware ********/

router.use(async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const user = jwt.verify(token.split(" ")[1], "MY_SECRET");
    req.user = user;
    next();
  } catch (e) {
    return res.json({ msg: "TOKEN NOT FOUND / INVALID" });
  }
});

/******* below are all the routes that WILL pass through the middleware ********/

router.use("/project", projectRouter);
router.use("/projectManagement", projectManagementRouter);
router.use("/rating", ratingRouter);
router.use("/user", userRouter);
module.exports = router;
