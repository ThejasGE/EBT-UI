const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const LightToBleSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    lightId: {
        type: Schema.ObjectId,
        ref: 'Lights',
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
    status: {
        type: Boolean,
        default: false
    },
    lightIntensity: {
        type: Number,
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
LightToBleSchema.pre('save', function(next) {
    next();
});
LightToBleSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})

var LightData = mongoose.model('LightToBle', LightToBleSchema);
module.exports = LightToBleSchema;