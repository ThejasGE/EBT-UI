const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SegmentToBleSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: "Floors",
        index: true
    },
    segmentId: {
        type: Schema.ObjectId,
        ref: 'Segments',
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
    peopleCount: {
        type: Number,
        index: true,
        min: 0
    },
    lastUpdated: {
        type: Date,
        index: true
    },
    status: {
        type: Boolean,
        default: false
    },
});
SegmentToBleSchema.pre('save', function(next) {
    next();
});
SegmentToBleSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
SegmentToBleSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        if (ret.lastUpdated)
            ret.lastUpdated = ret.lastUpdated.getTime();
        else
            ret.lastUpdated = ret.lastUpdated;
        delete ret._id;
        delete ret.__v;
    }
});
var SegmentToBle = mongoose.model('SegmentToBles', SegmentToBleSchema);
module.exports = SegmentToBleSchema;