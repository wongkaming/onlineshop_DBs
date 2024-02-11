const router = require("express").Router();
const User = require("../models/user")
const jwt = require("jsonwebtoken");

const authCheck = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    return res.send("fail");
  }
};

router.get("/", authCheck, async (req, res) => {
  const googleUser = await User.findOne({ googleID: req.user.googleID });
  if (!googleUser) {
    return res.status(401).send("cannot find the user");
  }

  return res.render("profile");

});

router.get("/data", authCheck, async (req, res) => {
  const googleUser = await User.findOne({ googleID: req.user.googleID });
  if (!googleUser) {
    return res.status(401).send("cannot find the user");
  }

  const tokenObject = { _id: googleUser._id, email: googleUser.email };
  const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
  return res.send({message: "Verified Google User",token: "JWT " + token,user: googleUser});

});



module.exports = router;
