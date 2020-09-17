const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const BookingDetailsSchema = new Schema({
    employeeId: {
        type: Schema.ObjectId,
        ref: 'Employees',
        index: true
    },
    seatId: {
        type: Schema.ObjectId,
        ref: 'Seats',
        index: true
    },
    inTime: {
        type: Date,
        index: true
    },
    outTime: {
        type: Date,
        index: true
    },
    duration: {
        type: Number,
        default: 28800
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    webBooked: {
        type: Boolean,
        default: false
    }
});
BookingDetailsSchema.pre('save', function(next) {
    next();
});
BookingDetailsSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
BookingDetailsSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var BookingDetails = mongoose.model('BookingDetails', BookingDetailsSchema);
module.exports = BookingDetailsSchema;