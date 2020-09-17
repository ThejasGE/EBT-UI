const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BuildingSchema = new Schema({
    name: {
        type: String,
        index: true
    },
    alias: {
        type: String
    },
    timezone: {
        type: String,
    },
    timezoneOffset: {
        type: Number,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    floors: {
        type: [{ type: Schema.ObjectId, ref: 'Floors' }]
    },
    hasOccupancy: {
        type: Boolean
    },
    hasLMS: {
        type: Boolean
    }
});
BuildingSchema.pre('save', function(next) {
    next();
});
BuildingSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
BuildingSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Building = mongoose.model('Buildings', BuildingSchema);
module.exports = BuildingSchema;