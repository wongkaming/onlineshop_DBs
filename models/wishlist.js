const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishlistSchema = new Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clothe",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  admin: {
    type: [String],
    default: [],
  },

});

module.exports = mongoose.model("Wishlist", wishlistSchema);
