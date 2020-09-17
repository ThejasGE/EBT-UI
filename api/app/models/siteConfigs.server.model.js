const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const siteConfgsSchema = new Schema({
    id: {
        type: Schema.ObjectId,
        index: true
    },
    time: { type: Date, default: Date.now },
    siteName: {
        type: String
    },
    buildings: { 
        type: Schema.ObjectId,
        index: true
    },
    nova: {
        shippment:Number,
        installed: Number,
        working: Number
    },
    desk:{
        shippment:Number,
        installed: Number,
        working: Number
    },
    host:{
        shippment:Number,
        installed: Number,
        working: Number
    },
    daylightOccupancy: {
        shippment:Number,
        installed: Number,
        working: Number
    },
    wlad: {
        shippment:Number,
        installed: Number,
        working: Number
    },
    shippingDate: {
        type: Date
    },
    salesTypes: {
        type: String
    }
});
siteConfgsSchema.index({ buildings:1 });
siteConfgsSchema.pre('save', function(next) {
    next();
});
siteConfgsSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
siteConfgsSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var siteConfigs = mongoose.model('siteconfigs', siteConfgsSchema);
module.exports = siteConfgsSchema;