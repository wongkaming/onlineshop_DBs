const mongoose = require("mongoose");
const {Schema} = mongoose;

const eventSchema = new Schema({
    
    title: {type: String, require: true, minlength: 5},
    gallerywrap: [{type: String, require: true}],
    bio: {type: String, require: true, minlength: 10},
    description: {type: String, require: true, minlength: 10},
    date: {type: String, require: true},

});

const Event = mongoose.model("Event", eventSchema); //collection name, schema
module.exports = Event;