/**
 * Created by Pavel on 12.10.2016.
 */

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PlaceSchema   = new Schema({
    name: String,
    address: String,
    lat: Number,
    lng: Number

});

module.exports = mongoose.model('Place', PlaceSchema);