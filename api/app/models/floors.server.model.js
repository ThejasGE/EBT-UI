const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FloorSchema = new Schema({
    name: {
        type: String,
        index: true
    },
    alias: {
        type: String
    },
    layout: {
        type: String
    },
    width: {
        type: Number,
        default: 1680
    },
    height: {
        type: Number,
        default: 1050
    },
    cps: {
        type: Number
    },
    fa: {
        type: String,
        index: true
    },
    buildingId: {
        type: Schema.ObjectId,
        ref: 'Buildings',
        index: true
    },
    sections: {
        type: [{ type: Schema.ObjectId, ref: 'Sections' }]
    }
});
FloorSchema.pre('save', function(next) {
    next();
});
FloorSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
FloorSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Floors = mongoose.model('Floors', FloorSchema);
module.exports = FloorSchema;