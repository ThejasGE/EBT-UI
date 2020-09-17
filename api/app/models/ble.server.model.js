const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const BleSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts'
    },
    address: {
        type: String,
        index: true
    },
    isHost: {
        type: Boolean,
        default: false,
        index: true
    },
    hasOccupancy: {
        type: Boolean,
        default: false
    },
    hasTemperature: {
        type: Boolean,
        default: false
    },
    hasDensity: {
        type: Boolean,
        default: false
    }
});
BleSchema.pre('save', function(next) {
    next();
});
BleSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
BleSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Ble = mongoose.model('Ble', BleSchema);
module.exports = BleSchema;