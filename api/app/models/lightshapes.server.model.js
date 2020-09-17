const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LightShapesSchema = new Schema({

    name: {
        type: String,
        index: true,
        unique: true
    },
    class: {
        type: String,
            index: true
    },
    active: {
        type: Boolean,
        index: true,
        default: true
    }

});
// , { collection: "LightShapes" });
// mongoose.model('LightShapesModel', LightShapesSchema);

LightShapesSchema.pre('save', function(next) {
    next();
});
LightShapesSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
});
LightShapesSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var LightShape = mongoose.model('LightShape', LightShapesSchema);
module.exports = LightShapesSchema;