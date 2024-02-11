const router = require("express").Router();
const Wishlist = require("../models/wishlist");
const Cloth = require("../models/clothes");
const ClothesBM = require("../models/clothes-bm")
const wishlistValidation = require("../validation").wishlistValidation;

router.use((req, res, next) => {
  // console.log("course route正在接受一個request...");
  next();
});

// 獲得所有user的wishlist
router.get("/admin", async (req, res) => {
  if (req.user.isUser()) {
    return res
      .status(400)
      .send("只有admin才能觀看。");
  }
    try {
      let clothesBMFound = await ClothesBM.find({})
        .populate("item", ["title", "galleryWrap","price", "category"])
        .populate("user", ["username"])
        .exec();
      return res.send(clothesBMFound);
    } catch (e) {
        console.log(e)
      return res.status(500).send(e);
    }
});

// 用user id來尋找自己的wishlist
router.get("/:_user_id", async (req, res) => {
  let { _user_id } = req.params;
  if (req.user._id != _user_id) {
    return res
      .status(400)
      .send("error");
  }
  let wishlistFound = await Wishlist.find({ user: _user_id })
    .populate("item", ["title", "galleryWrap","price", "category"])
    .exec();
  

  return res.send(wishlistFound);
});

// 用item id尋找wishlist
router.get("/item/:_id", async (req, res) => {
    let { _id } = req.params;
    let userid = req.user._id;

    try {
      let wishlistFound = await Wishlist.findOne({ item: _id, user: userid })
        .populate("item", ["title", "galleryWrap","price", "category"])
        .exec();

        return res.send(Boolean(wishlistFound));
      // return res.send(wishlistFound);
    } catch (e) {
      return res.status(500).send(e);
    }
});

// 新增
router.post("/", async (req, res) => {
    // 驗證數據符合規範
    let { error } = wishlistValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
  
    if (req.user.isAdmin()) {
      return res
        .status(400)
        .send("只有user才能管理自己的wishlist。");
    }
  
    let { item } = req.body;
    
    try {
        let clothID = await Cloth.findOne({ _id: item }).exec();
        let itemFound = await Wishlist.findOne({ item: clothID._id, user: req.user._id }).exec();
        
        if (!clothID) {
            return res.status(404).send("找不到对应的Cloth。");
        }
        if (itemFound) {
            return res.status(404).send("已加到wishlist");
        }

      let newWishlist = new Wishlist({
        item: clothID._id,
        user: req.user._id,
      });
      let savedWishlist = await newWishlist.save();
      let updatedData = await ClothesBM.findOneAndUpdate({item: clothID._id}, { $push: { user: savedWishlist.user }}).exec();
      return res.send({savedWishlist, updatedData});
    } catch (e) {
      return res.status(500).send(e);
    }
});

router.delete("/item/:_id", async (req, res) => {
  let { _id } = req.params;
  if (req.user.isAdmin()) {
    return res
      .status(400)
      .send("只有user才能管理自己的wishlist。");
  }

  try {
    let wishlistFound = await Wishlist.findOne({ item: _id, user: req.user._id }).exec();
    if (!wishlistFound) {
      return res.status(400).send("無法刪除課程。");
    }

    let deletedWishlist = await Wishlist.deleteOne({ item: _id, user: req.user._id }).exec();
    let updatedData = await ClothesBM.findOneAndUpdate({item: _id}, { $pull: {user: req.user._id} }).exec();
    return res.send({deletedWishlist, updatedData});
  
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;