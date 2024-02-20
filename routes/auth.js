const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models/user")
const jwt = require("jsonwebtoken");
const passport = require("passport");

router.use((req, res, next) => {
  next();
});

router.get("/login", (req, res) => {
  return res.send("login");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.post("/register", async (req, res) => {
  //確認數據是否符合規範
  let { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // 確認信箱是否被註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("Account already exists.");

  // 製作新用戶
  let { email, username, password, role, confirmPassword } = req.body;

  try {
    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match.");
    } else {
      const accountCount = await User.countDocuments();
      if (accountCount < 26) {
      let newUser = new User({ email, username, password, role });
      let savedUser = await newUser.save();

      return res.send({
        msg: "使用者成功儲存。",
        savedUser,
      });} else {
        return res.status(400).send("The maximum number of registered users has been reached.")
      }
    }
  } catch (e) {
    return res.status(500).send("Your account cannot be created at this time. Please try it later.");
  }
});

router.post("/login", async (req, res) => {
  //確認數據是否符合規範
  let { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // 確認信箱是否被註冊過
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser) {
    return res.status(401).send("Invalid email address or password");
  }

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      // 製作json web token
      const tokenObject = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
      return res.send({
        message: "Verified",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("Invalid email address or password");
    }
  });
});


router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  //進入redirect區域
  return res.redirect("/latest/profile");
});

router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    if (err) {
      return next(err);
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.send('logout');
  });

});

module.exports = router;
