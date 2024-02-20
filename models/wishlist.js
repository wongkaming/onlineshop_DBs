const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema({
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clothe",
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }

});

module.exports = mongoose.model("Wishlist", wishlistSchema);
