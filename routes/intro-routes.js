const express = require("express");
const router = express.Router();
const Intro = require("../models/intro");
// const multer  = require('multer')
// const path = require("path")

// const storage = multer.diskStorage({
//     destination: './uploads/intro',
//     filename: (req, file, cb) => {
//         return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })
// const upload = multer({
//     storage: storage
// })


router.get("/", async (req, res) => {
    try {
        let data = await Intro.find({}).exec();
        return res.render("intro", {data}); //ejs name, info
    } catch(e) {
        return res.status(500).render("error")
    }
})

router.get("/all", async (req, res) => {
    try {
        let data = await Intro.find({}).exec();
        return res.send(data)
    } catch(e) {
        return res.status(500).render("not-found")
    }
})

//去新增頁面
router.get("/new", async (req, res) => {
    return res.render("new-intro-form");
})


//儲存upload.single('coverimage'),
router.post("/",  async (req, res) => { //upload single要與html的name一樣
    try {
        let { title, description, category, coverimage, hostimage1, hostimage2, hostimage3 } = req.body;
        // const coverimage = `http://localhost:4040/introimage/${req.file.filename}`;
        let NewIntro = new Intro({
            title, 
            description, 
            category,
            coverimage,
            hostimage1, 
            hostimage2, 
            hostimage3,
        });
        let savedIntro = await NewIntro.save();
        console.log(savedIntro)
        // console.log(req.file)
        return res.render("intro-save-success", {savedIntro});
    } catch(e) {
        return res.status(500).render("save-fail");
    }

});

router.get("/:_id", async (req, res, next) => {
    let { _id } = req.params;
    try {
        let introID = await Intro.findOne({ _id }).exec();
        
        if (introID != null) {
            return res.render("intro-page", {introID});
        } else {
            return res.status(400).render("not-found");
        }
        
    } catch(e) {
        return res.status(400).render("not-found")
    }
})

// get into edit page
router.get("/:_id/edit", async (req,res) => {
    let { _id } = req.params;
    try {
        let introID = await Intro.findOne({ _id }).exec();
        if (introID != null) {
            return res.render("edit-intro", {introID});
        } else {
            return res.status(400).render("not-found");
        }
        
    } catch(e) {
        return res.status(400).render("not-found")
    }
})

// save and update page
router.put("/:_id", async (req, res) => {
    let {title, description, category, coverimage, hostimage1, hostimage2, hostimage3} = req.body;
    let { _id } = req.params;
    try {
        let updatedIntro = await Intro.findOneAndUpdate(
        {_id}, 
        {title, description, category, coverimage, hostimage1, hostimage2, hostimage3}, 
        {
            new: true, 
            runValidators: true, 
            overwrite: true,
        });
        return res.render("update-success", {updatedIntro});
    } catch(e) {
        return res.status(400).send(e);
        
    }
})

router.patch("/:_id", async (req, res) => {
    try {
      let { _id } = req.params;
      let { title, description, category, coverimage, hostimage1, hostimage2, hostimage3} = req.body;
   
      let newData = await Intro.findByIdAndUpdate(
        { _id },
        { title, description, category, coverimage, hostimage1, hostimage2, hostimage3},
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
        let introID = await Intro.findOne({ _id }).exec();
        if (introID != null) {
            return res.render("delete-intro", {introID});
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
      const deletedIntro = await Intro.deleteOne({_id});
      return res.render("delete-success", {deletedIntro});
    } catch (error) {
      return res.status(500).send("Cannot delete Intro");
    }
});



module.exports = router;