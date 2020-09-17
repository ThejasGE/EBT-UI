const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LightTypeSchema = new Schema({

    name: {
        type: String,
        index: true,
        unique: true
    },
    wattage: {
        type: Number,
        index: true
    },
    shapename: {
        type: String,
        index: true
    },
    shape: {
        type: String,
        index: true
    },
    discription: {
        type: String
    }
});
// , { collection: "LightTypes" });
// mongoose.model('LightTypeModel', LightTypeSchema);

LightTypeSchema.pre('save', function(next) {
    next();
});
LightTypeSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
});
LightTypeSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var LightType = mongoose.model('LightType', LightTypeSchema);
module.exports = LightTypeSchema;