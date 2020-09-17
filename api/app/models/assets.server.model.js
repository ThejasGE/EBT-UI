const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const AssetSchema = new Schema({
    name: {
        type: String
    }
});
AssetSchema.pre('save', function(next) {
    next();
});
AssetSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
AssetSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Asset = mongoose.model('Asset', AssetSchema);
module.exports = AssetSchema;