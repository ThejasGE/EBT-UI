var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var SeatSettings = new Schema({

    size: Number,
    type: String

}, { collection: 'Seat_Settings' });
SeatSettings.pre('save', function(next) {
    next();
});
SeatSettings.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
});
var SeatSettingModel = mongoose.model('SeatSettingModel', SeatSettings);
module.exports = SeatSettings;