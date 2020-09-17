const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SectionSchema = new Schema({
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts'
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
    maxseats: {
        type: String,
        index: true
    },
    expDate: {
        type: Date,
        index: true
    },
    webcoreName: {
        type: String
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
    isRoom: {
        type: Boolean,
        default: true
    },
    class: {
        type: String,
            default: ""
    },
    rotate: {
        type: SchemaTypes.Double,
        default: 0.00
    },
    seats: {
        type: [{ type: Schema.ObjectId, ref: 'Seats' }]
    }
});
SectionSchema.pre('save', function(next) {
    next();
});
SectionSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
SectionSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Sections = mongoose.model('Sections', SectionSchema);
module.exports = SectionSchema;