const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
    name: {
        type: String,
        index: true
    },
    buildingName: {
        type: String
    },
    location: {
        type: String
    },
    saleType: {
        type: String
    },
    hasOccupancy: {
        type: Boolean
    },
    hasLMS: {
        type: Boolean
    },
    hasParking: {
        type: Boolean
    },
    hasOpenArea: {
        type: Boolean
    },
    hasCrbs: {
        type: Boolean
    },
    hasHotdesk: {
        type: Boolean
    },
    hasAllocation: {
        type: Boolean
    },
    status: {
        type: Boolean,
        default: false
    },

});
CustomerSchema.pre('save', function(next) {
    next();
});
CustomerSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
CustomerSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var customer = mongoose.model('customer', CustomerSchema);
module.exports = CustomerSchema;