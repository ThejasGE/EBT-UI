const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const OccAggSchema = new Schema({
    day: {
        type: Date,
        index: true
    },
    sensorId: {
        type: Schema.ObjectId,
        ref: 'Ble',
        index: true
    },
    done: {
        type: Boolean
    },
    "00:00": {
        type: Number
    },
    "01:00": {
        type: Number
    },
    "02:00": {
        type: Number
    },
    "03:00": {
        type: Number
    },
    "04:00": {
        type: Number
    },
    "05:00": {
        type: Number
    },
    "06:00": {
        type: Number
    },
    "07:00": {
        type: Number
    },
    "08:00": {
        type: Number
    },
    "09:00": {
        type: Number
    },
    "10:00": {
        type: Number
    },
    "11:00": {
        type: Number
    },
    "12:00": {
        type: Number
    },
    "13:00": {
        type: Number
    },
    "14:00": {
        type: Number
    },
    "15:00": {
        type: Number
    },
    "16:00": {
        type: Number
    },
    "17:00": {
        type: Number
    },
    "18:00": {
        type: Number
    },
    "19:00": {
        type: Number
    },
    "20:00": {
        type: Number
    },
    "21:00": {
        type: Number
    },
    "22:00": {
        type: Number
    },
    "23:00": {
        type: Number
    }
});
OccAggSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var OccAgg = mongoose.model('OccupancyAggregation', OccAggSchema);
module.exports = OccAggSchema;