var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var validator = require('../helpers/validators');

var userSchema = new Schema({
    "_id": String,
    "name":{type:String, required:true},
    "email": {type: String, required: true, unique:true},
    "password":{type: String, required: true},
    "mobileNumber": {type: String, required: false},
    "DOB":{type:String, required:true},
    "messages":{type:Schema.Types.Mixed},
    "profileImage": {type: Schema.Types.Mixed, required: false},
    "createdTs": { type: Date, required: false, "default": Date.now },
    "modifiedTs": { type: Date, required: false, "default": Date.now }
});


userSchema.pre('save', function(next) {
    this.modifiedTs = new Date();
    next();
});
module.exports = userSchema;
