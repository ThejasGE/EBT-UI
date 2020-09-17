const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SensorHealthLogSchema = new Schema({
    sensorId: {
        type: Schema.ObjectId,
        ref: 'Ble',
        index: true
    },
    status: {
        type: Boolean,
        index: true
    },
    time: {
        type: Date,
        index: true
    }
});
SensorHealthLogSchema.index({ sensorId: 1, time: 1, status: 1 });
SensorHealthLogSchema.pre('save', function(next) {
    next();
});
SensorHealthLogSchema.post('save', function(doc, next) {
    next();
})
SensorHealthLogSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var SensorHealthLog = mongoose.model('SensorHealthLog', SensorHealthLogSchema);
module.exports = SensorHealthLogSchema;