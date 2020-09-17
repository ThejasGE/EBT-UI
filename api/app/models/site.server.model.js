const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SiteSchema = new Schema({
    name: {
        type: String
    },
    location: {
        type: String
    },
    latitude: {
        type: SchemaTypes.Double
    },
    longitude: {
        type: SchemaTypes.Double
    },
    buildings: [{ type: Schema.ObjectId, ref: 'Buildings' }]
});
SiteSchema.pre('save', function(next) {
    next();
});
SiteSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
SiteSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Site = mongoose.model('Site', SiteSchema);
module.exports = SiteSchema;