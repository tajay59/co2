const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.set('useFindAndModify', false);


//============ Create Schema =========================
var pwSchema = new mongoose.Schema({
    name:{type: String,default:"Name&Password"},
    // temperature:{type:Number, default:32},
    // bpm:{type:Number, default:32},
    // orientation:{type: String, default:"No Orientation"


});

var pw = mongoose.model('pw',pwSchema);
module.exports = pw;
