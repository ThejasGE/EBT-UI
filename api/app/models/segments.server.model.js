const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SegmentSchema = new Schema({
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts'
    },
    bleId: {
        type: Schema.ObjectId,
        ref: 'Ble',
        index: true
    },
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    name: {
        type: String,
        index: true
    },
    alias: {
        type: String,
        index: true
    },
    width: {
        type: SchemaTypes.Double,
        default: 300
    },
    height: {
        type: SchemaTypes.Double,
        default: 300
    },
    posX: {
        type: SchemaTypes.Double,
        default: 0.00
    },
    posY: {
        type: SchemaTypes.Double,
        default: 0.00
    },
    capacity: {
        type: Number,
        default: 0
    },
    rotate: {
        type: SchemaTypes.Double,
        default: 0.00
    }
});
SegmentSchema.pre('save', function(next) {
    next();
});
SegmentSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
SegmentSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Segments = mongoose.model('Segments', SegmentSchema);
module.exports = SegmentSchema;