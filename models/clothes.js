const mongoose = require("mongoose");
const {Schema} = mongoose;

const clothesSchema = new Schema({
    
    title: {type: String, require: true, minlength: 5},
    galleryWrap: [{type: String, require: true}],
    category: {type: String, require: true},
    description: {type: String, require: true, minlength: 10},
    price: {type: Number, require: true},
    stock: {type: Number, require: true},
    dicountTags: {type: String},
    typeSelector: [String],
    sizeSelector: [String],
    model3d: {type: String},

});

const Clothes = mongoose.model("Clothe", clothesSchema); //collection name, schema
module.exports = Clothes;