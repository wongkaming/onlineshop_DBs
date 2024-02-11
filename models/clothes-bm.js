const mongoose = require("mongoose");
const {Schema} = mongoose;

const bookmarksSchema = new Schema({
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothe",
    },
    user: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],

});

const Bookmarks = mongoose.model("Bookmark", bookmarksSchema); //collection name, schema
module.exports = Bookmarks;
