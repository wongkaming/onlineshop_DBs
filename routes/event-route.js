const express = require("express");
const router = express.Router();
const Event = require("../models/event");


router.get("/", async (req, res) => {
    try {
        let data = await Event.find({}).exec();
        return res.render("event", {data}); //ejs name, info
    } catch(e) {
        return res.status(500).render("error")
    }
})

router.get("/all", async (req, res) => {
    try {
        let data = await Event.find({}).exec();
        return res.send(data)
    } catch(e) {
        return res.status(500).render("not-found")
    }
})

//去新增頁面
router.get("/new", async (req, res) => {
    return res.render("new-event-form");
})


//儲存upload.single('coverimage'),
router.post("/",  async (req, res) => { //upload single要與html的name一樣
    try {
        let { title, gallerywrap, bio, description, date } = req.body;
        let NewEvent = new Event({
            title, 
            gallerywrap,
            bio,
            description,
            date,
        });
        let savedEvent = await NewEvent.save();
        return res.render("event-save-success", {savedEvent});
    } catch(e) {
        return res.status(500).render("save-fail");
    }

});

router.get("/:_id", async (req, res, next) => {
    let { _id } = req.params;
    try {
        let eventID = await Event.findOne({ _id }).exec();
        
        if (eventID != null) {
            return res.render("event-page", {eventID});
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
        let eventID = await Event.findOne({ _id }).exec();
        if (eventID != null) {
            return res.render("edit-event", {eventID});
        } else {
            return res.status(400).render("not-found");
        }
        
    } catch(e) {
        return res.status(400).render("not-found")
    }
})

// save and update page
router.put("/:_id", async (req, res) => {
    let {title, gallerywrap, bio, description, date} = req.body;
    let { _id } = req.params;
    try {
        let updatedEvent = await Event.findOneAndReplace(
        {_id}, 
        {title, gallerywrap, bio, description, date}, 
        {
            new: true, 
            runValidators: true, 
            overwrite: true,
        });
        return res.render("event-update-success", {updatedEvent});
    } catch(e) {
        return res.status(400).send(e);
        
    }
})

router.patch("/:_id", async (req, res) => {
    try {
      let { _id } = req.params;
      let { title, gallerywrap, bio, description, date} = req.body;
   
      let newData = await Event.findByIdAndUpdate(
        { _id },
        { title, gallerywrap, bio, description, date},
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
        let eventID = await Event.findOne({ _id }).exec();
        if (eventID != null) {
            return res.render("delete-event", {eventID});
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
      const deletedEvent = await Event.deleteOne({_id});
      return res.render("event-delete-success", {deletedEvent});
    } catch (error) {
      return res.status(500).send("Cannot delete event");
    }
});



module.exports = router;