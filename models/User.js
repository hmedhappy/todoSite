const mongoose = require('mongoose') ;



var userSchema = new mongoose.Schema({
    username : {type : String},
    password : {type: String},
    user : {type:Object},
    project : {type:String}

})

var User  = mongoose.model('todousers',userSchema) ;
module.exports = User ;