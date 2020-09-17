const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SeatTypeSchema = new Schema({

    name: {
        type: String,
        index: true,
        unique: true
    },
    area: {
        type: Number,
        index: true
    },
    cost: {
        type: Number,
        index: true
    },
    shapename: {
        type: String,
        index: true
    },
    shape: {
        type: String,
        index: true
    },
    discription: {
        type: String
    }
}, { collection: "SeatTypes" });
SeatTypeSchema.pre('save', function(next) {
    next();
});
SeatTypeSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
});
var SeatTypeModel = mongoose.model('SeatTypeModel', SeatTypeSchema);
module.exports = SeatTypeSchema;