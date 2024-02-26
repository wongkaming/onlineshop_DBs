const router = require("express").Router();
const CartItem = require("../models/cartItem");
const Cloth = require("../models/clothes");

router.use((req, res, next) => {
  next();
});

// 用user id來尋找自己的cart
router.get("/:_user_id", async (req, res) => {
  let { _user_id } = req.params;
  if (req.user._id.toString() != _user_id) {
    return res
      .status(400)
      .send("error");
  }
  let cartFound = await CartItem.findOne({ user: _user_id }) //findOne return an object
    .populate("items.item", ["title", "galleryWrap","price", "category"])
    .exec();

  if (!cartFound) {
    let newCartItem = new CartItem({
      items: [],
      user: _user_id,
    });
    let savedCartItem = await newCartItem.save();
    return res.status(201).send(savedCartItem);
  }

  return res.send(cartFound);
});


// 新增
router.post("/", async (req, res) => {
    let { item, size, color, quantity } = req.body;
    
    try {
        let clothID = await Cloth.findOne({ _id: item._id }).exec();
                
        if (!clothID) {
            return res.status(404).send("This item does not exist.");
        }

        let userFound = await CartItem.findOne({user: req.user._id}).exec();
        if (!userFound) {
            const newCartItem = new CartItem({
              user: req.user._id,
              items: [{ item, size, color, quantity: quantity || 1 }]
            });
            const savedCartItem = await newCartItem.save();
            return res.status(201).send(savedCartItem);
        }



        const itemIndex = userFound.items.findIndex((i) => 
            i.item._id.equals(item._id) && //用 Mongoose 的 .equals 方法
            i.size === size &&
            (!color || i.color === color)
        );
        if (itemIndex > -1) {
            if (userFound.items[itemIndex].quantity == 3) {
                return res.status(400).send("已加到cart, 已有3件");
            }
            const updatedCartItem = await CartItem.findOneAndUpdate(
                { "user": req.user._id, "items._id": userFound.items[itemIndex]._id },
                { $inc: { "items.$.quantity": 1 } }, 
                { new: true }
            ).populate("items.item", ["title", "galleryWrap","price", "category"]).exec();

            return res.status(200).send(updatedCartItem);

        } else {
            const updatedCartItem = await CartItem.findOneAndUpdate(
              { user: req.user._id },
              { $push: { items: { $each: [{item, size, color, quantity}], $position:0 } } },
              { new: true }
            ).populate("items.item", ["title", "galleryWrap","price", "category"]).exec();
      
            return res.status(200).send(updatedCartItem);
        }

    } catch (e) {
      return res.status(500).send(e);
    }
});


router.post("/update", async (req, res) => {
  try {
    let { updatedItems } = req.body;

    let userFound = await CartItem.findOne({user: req.user._id}).exec();
    if (userFound) {
      let newData = await CartItem.findByIdAndUpdate(
        userFound._id,
        { items: updatedItems },
        {
            new: true,
            runValidators: true,
            // overwrite: true
        }).populate("items.item", ["title", "galleryWrap","price", "category"]).exec(); //一定要popalate, 否則只回傳id到前端
        return res.status(200).send(newData);
    } else {
      return res.status(404).send("User cart is not found.");
    }


  } catch (e) {
    return res.status(500).send(e.message);
  }
});


router.delete("/allitem", async (req, res) => {

  try {
    let itemFound = await CartItem.findOne({ user: req.user._id }).exec();
    if (!itemFound) {
      return res.status(400).send("cannot delete");
    }

    let deletedCartItem = await CartItem.deleteOne({ user: req.user._id }).exec();
    // let updatedData = await ClothesBM.findOneAndUpdate({item: _id}, { $pull: {user: req.user._id} }).exec();
    return res.send({deletedCartItem});
  
  } catch (e) {
    return res.status(500).send(e);
  }
});

module.exports = router;