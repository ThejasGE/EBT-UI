const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const LightSensorToBleSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    lightSensorId: {
        type: Schema.ObjectId,
        ref: 'lightSensors',
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
    lightBles: {
        type: Schema.ObjectId,
        ref: 'Ble',
        index: true
    },
    lights: {
        type: [{ type: Schema.ObjectId, ref: 'Lights' }]
    },
    status: {
        type: Boolean,
        default: false
    },
    lastStatusUpdate: {
        type: Date,
        index: true
    },
    occupancy: {
        type: Number,
        default: 0
    }
});
LightSensorToBleSchema.pre('save', function(next) {
    next();
});
LightSensorToBleSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
});

var LightSensorData = mongoose.model('LightSensorToBle', LightSensorToBleSchema);
module.exports = LightSensorToBleSchema;