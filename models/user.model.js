var mongoose = require('mongoose')
//var errorHandler = require('../helpers/error_handler');
var UserSchema = require('../Schemas/user.schema');
var User= mongoose.model('user',UserSchema);
var uuid = require('node-uuid');
var validator = require('../helpers/validators');

var saveNewUser = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "saveNewUser > callback must be a function"});
    }

    var newUser = new User({
        _id:uuid.v1(),
        name: params.name,
        email : params.email,
        password : params.password,
        mobileNumber : params.mobileNumber,
        DOB: params.DOB
    });
    newUser.save(function(error,userData){
          return callback(error, { user : userData, isNewProfile: true});
    });

}

module.exports = {
    saveNewUser : saveNewUser
}