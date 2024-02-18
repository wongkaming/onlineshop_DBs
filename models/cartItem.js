const mongoose = require("mongoose");
const { Schema } = mongoose;


const itemSchema = new Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Clothe",
  },
  size: { type: String, required: true },
  color: { type: String },
  quantity: { type: Number, default: 1 },
});

const cartItemSchema = new Schema({
  items: [itemSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("CartItem", cartItemSchema);
