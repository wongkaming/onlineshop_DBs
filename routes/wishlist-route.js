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
      return res.status(200).send(clothesBMFound);
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
  let wishlistFound = await Wishlist.findOne({ user: _user_id })
    .populate("items", ["title", "galleryWrap","price", "category"])
    .exec();

    if (!wishlistFound) {
      let newWishlist = new Wishlist({
        items: [],
        user: req.user._id,
      });
      let savedWishlist = await newWishlist.save();
      return res.status(200).send(savedWishlist);
    }
  

  return res.status(200).send(wishlistFound);
});

// 用item id尋找wishlist
router.get("/item/:_id", async (req, res) => {
    let { _id } = req.params;
    let userid = req.user._id;

    try {
      let userFound = await Wishlist.findOne({user: userid}).exec();

      if (!userFound) {
        return res.status(404).send("找不到用戶");
      }

      const itemIndex = userFound.items.findIndex((i) => i.equals(_id));
      // let wishlistFound = await Wishlist.findOne({ items: userFound.items[itemIndex]._id, user: userid })
      //   .populate("items", ["title", "galleryWrap","price", "category"])
      //   .exec();

      if (itemIndex === -1) {
        return res.status(200).send(false);
      } else {
        return res.status(200).send(true);
      }
      // return res.send(wishlistFound);
    } catch (e) {
      return res.status(500).send(e);
    }
});

// 新增
router.post("/", async (req, res) => {
  if (req.user.isAdmin()) {
    return res
      .status(400)
      .send("只有user才能管理自己的wishlist。");
  }
  let { error } = wishlistValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { item } = req.body; //_id
  
  try {
    let clothID = await Cloth.findOne({ _id: item }).exec();
    if (!clothID) {
      return res.status(404).send("This item does not exist.");
    }      
      let userFound = await Wishlist.findOne({user: req.user._id}).exec();

      if (!userFound) {
        let newWishlist = new Wishlist({
          items: [clothID._id],
          user: req.user._id,
        });
        let savedWishlist = await newWishlist.save();
        let updatedData = await ClothesBM.findOneAndUpdate({item: clothID._id}, { $push: { user: savedWishlist.user }}).exec();
        return res.status(200).send({savedWishlist, updatedData});
      }

      const itemIndex = userFound.items.findIndex((i) => i._id.equals(item));
      
      if (itemIndex === -1) {
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { user: req.user._id },
          { $push: { items: clothID._id }},
          { new: true }
        ).populate("items", ["title", "galleryWrap","price", "category"]).exec();

        let updatedData = await ClothesBM.findOneAndUpdate({item: clothID._id}, { $push: { user: updatedWishlist.user }}).exec();
        return res.status(200).send({updatedWishlist, updatedData});
      } else {
        return res.status(404).send("Added to the wishlist");
      }
      
  } catch (e) {
    console.error(e);
    return res.status(500).send(e.message);
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
    let wishlistFound = await Wishlist.findOne({user: req.user._id}).exec();

    if (!wishlistFound) {
      return res.status(404).send("wishlist has not been built");
    }

    let clothID = await Cloth.findOne({ _id: _id }).exec();
    if (!clothID) {
      return res.status(404).send("This item does not exist.");
    }

    const itemIndex = wishlistFound.items.findIndex((i) => i.equals(_id));
    
    if (itemIndex > -1) {
      let deletedWishlist = await Wishlist.findOneAndUpdate({user: req.user._id}, { $pull: { items: clothID._id }}).exec();
      let updatedData = await ClothesBM.findOneAndUpdate({item: _id}, { $pull: {user: req.user._id} }).exec();
      return res.status(200).send({deletedWishlist, updatedData});
    }else {
      return res.status(404).send("deleted");
    }
  
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;