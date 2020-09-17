const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SensorToBleSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    seatId: {
        type: Schema.ObjectId,
        ref: 'Seats',
        index: true
    },
    bleId: {
        type: Schema.ObjectId,
        ref: 'Ble',
        index: true
    },
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts'
    },
    occupied: {
        type: Boolean,
        default: false,
        index: true
    },
    temperature: {
        type: SchemaTypes.Double,
        default: null
    },
    bookingId: {
        type: Schema.ObjectId,
        ref: 'BookingDetails',
        index: true,
        default: null
    },
    status: {
        type: Boolean,
        default: false
    },
    lastOccupied: {
        type: Date,
        index: true
    },
    lastStatusUpdate: {
        type: Date,
        index: true
    },
    lastDataPacket: {
        type: String
    }
});
SensorToBleSchema.pre('save', function(next) {
    next();
});
SensorToBleSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
SensorToBleSchema.set('toJSON', {
    transform: function(doc, ret, options) {

        ret.id = ret._id;
        if (ret.lastOccupied)
            ret.lastOccupied = ret.lastOccupied.getTime();
        else
            ret.lastOccupied = ret.lastOccupied;
        delete ret._id;
        delete ret.__v;
    }
});
var SensorData = mongoose.model('SensorToBle', SensorToBleSchema);
module.exports = SensorToBleSchema;