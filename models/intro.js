const mongoose = require("mongoose");
// const {Schema} = mongoose;

const introSchema = new mongoose.Schema({
    title: {type: String, require: true, minlength: 5},
    description: {type: String, require: true, minlength: 10},
    category: {type: String, require: true},
    coverimage: {type: String},
    hostimage1: {type: String},
    hostimage2: {type: String},
    hostimage3: {type: String},
});

const Intro = mongoose.model("Intro", introSchema);
module.exports = Intro;