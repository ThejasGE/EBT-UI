const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SensorDataSchema = new Schema({
    sensorId: {
        type: Schema.ObjectId,
        ref: 'Ble',
        index: true
    },
    occupancy: {
        type: Number,
        index: true
    },
    temperature: {
        type: SchemaTypes.Double,
        default: 0.00,
        index: true
    },
    density: {
        type: SchemaTypes.Double,
        default: null,
        index: true
    },
    humidity: {
        type: SchemaTypes.Double,
        default: null,
        index: true
    },
    intensity: {
        type: Number,
        default: null,
        index: true
    },
    time: {
        type: Date,
        index: true
    },
    dataPacket: {
        type: String,
    }
});
SensorDataSchema.index({ sensorId: 1, time: 1, occupancy: 1 });
SensorDataSchema.index({ sensorId: 1, time: 1, temperature: 1 });
SensorDataSchema.pre('save', function(next) {
    next();
});
SensorDataSchema.post('save', function(doc, next) {
    next();
})
SensorDataSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var SensorData = mongoose.model('SensorData', SensorDataSchema);
module.exports = SensorDataSchema;