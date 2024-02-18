const express = require("express");
const router = express.Router();
const Cloth = require("../models/clothes");
const ClothesBM = require("../models/clothes-bm")
const Wishlist = require("../models/wishlist");


router.get("/", async (req, res) => {
    try {
        let data = await Cloth.find({}).exec();
        return res.render("clothes", {data}); //ejs name, info
    } catch(e) {
        return res.status(500).render("error")
    }
})

router.get("/all", async (req, res) => {
    try {
        let data = await Cloth.find({}).exec(); // [产品数据...]
        const page = parseInt(req.query.page) || 1; 
        const perPage = parseInt(req.query.perPage) || 10;

        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedProducts = data.slice(startIndex, endIndex);

        return res.send(paginatedProducts)
    } catch(e) {
        return res.status(500).render("not-found")
    }
})

//去新增頁面
router.get("/new", async (req, res) => {
    return res.render("new-cloth-form");
})

//儲存upload.single('coverimage'),
router.post("/",  async (req, res) => { //upload single要與html的name一樣
    try {
        let { title, galleryWrap, category, description, price, dicountTags, typeSelector, sizeSelector, model3d } = req.body;
        let NewCloth = new Cloth({
            title, galleryWrap, category, description, price, dicountTags, typeSelector, sizeSelector, model3d
        });
        let savedCloth = await NewCloth.save();
        let newBookmark = new ClothesBM({
            item: savedCloth._id,
        });
        let savedBookmark = await newBookmark.save();
        return res.render("cloth-save-success", {savedCloth, savedBookmark});
    } catch(e) {
        return res.status(500).render("save-fail");
    }

});

//Duplicate
router.post("/:_id",  async (req, res) => { 
    let { _id } = req.params;
    try {
        let clothID = await Cloth.findOne({ _id }).exec();
        let NewCloth = new Cloth({
            title: clothID.title, 
            galleryWrap: clothID.galleryWrap, 
            category: clothID.category, 
            description: clothID.description,
            price: clothID.price, 
            dicountTags: clothID.dicountTags, 
            typeSelector: clothID.typeSelector, 
            sizeSelector: clothID.sizeSelector,
            model3d: clothID.model3d,
        });
        let savedCloth = await NewCloth.save();
        let newBookmark = new ClothesBM({
            item: savedCloth._id,
        });
        let savedBookmark = await newBookmark.save();
        return res.render("clothes", {data: savedCloth, savedBookmark});
    } catch(e) {
        return res.status(500).render("save-fail");
    }
});

router.get("/:_id", async (req, res, next) => {
    let { _id } = req.params;
    try {
        let clothID = await Cloth.findOne({ _id }).exec();
        
        if (clothID != null) {
            return res.render("cloth-page", {clothID});
        } else {
            return res.status(400).render("not-found");
        }
        
    } catch(e) {
        return res.status(400).render("not-found")
    }
})
router.get("/item/:_id", async (req, res, next) => {
    let { _id } = req.params;
    try {
        let clothID = await Cloth.findOne({ _id }).exec();
        
        if (clothID != null) {
            return res.send(clothID);
        } else {
            return res.status(400).send("not-found");
        }
        
    } catch(e) {
        return res.status(400).send("not-found")
    }
})

// get into edit page
router.get("/:_id/edit", async (req,res) => {
    let { _id } = req.params;
    try {
        let clothID = await Cloth.findOne({ _id }).exec();
        if (clothID != null) {
            return res.render("edit-cloth", {clothID});
        } else {
            return res.status(400).render("not-found");
        }
        
    } catch(e) {
        return res.status(400).render("not-found")
    }
})

// save and update page
router.put("/:_id", async (req, res) => {
    let { title, galleryWrap, category, description, price, dicountTags, typeSelector, sizeSelector, model3d} = req.body;
    let { _id } = req.params;
    try {
        let updatedCloth = await Cloth.findOneAndUpdate(
        {_id}, 
        { title, galleryWrap, category, description, price, dicountTags, typeSelector, sizeSelector, model3d}, 
        {
            new: true, 
            runValidators: true, 
            overwrite: true,
        });
        return res.render("cloth-update-success", {updatedCloth});
    } catch(e) {
        return res.status(400).send(e);
        
    }
})

router.patch("/:_id", async (req, res) => {
    try {
      let { _id } = req.params;
      let { title, galleryWrap, category, description, price, dicountTags, typeSelector, sizeSelector, model3d} = req.body;
   
      let newData = await Cloth.findByIdAndUpdate(
        { _id },
        { title, galleryWrap, category, description, price, dicountTags, typeSelector, sizeSelector, model3d},
        {
          new: true,
          runValidators: true,
          // 不能寫overwrite: true
        }
      );
      res.send({ msg: "成功更新資料!", updatedData: newData });
    } catch (e) {
        return res.status(400).render("save-fail");
    //   return res.status(400).send(e.message);
    }
});

router.get("/:_id/delete", async (req,res) => {
    let { _id } = req.params;
    try {
        let clothID = await Cloth.findOne({ _id }).exec();
        if (clothID != null) {
            return res.render("delete-cloth", {clothID});
        } else {
            return res.status(400).render("not-found");
        }
        
    } catch(e) {
        return res.status(400).render("not-found")
    }
})

router.delete("/:_id", async (req, res) => {
    try {
        let { _id } = req.params;
      const deletedCloth = await Cloth.deleteOne({_id});
      const deletedBookmark = await ClothesBM.deleteOne({ item: _id});
      const deletedWishlist = await Wishlist.deleteOne({ item: _id});
      return res.render("cloth-delete-success", {deletedCloth, deletedBookmark, deletedWishlist});
    } catch (error) {
      return res.status(500).send("Cannot delete Intro");
    }
});



module.exports = router;