const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const HostSchema = new Schema({
    buildingId: {
        type: Schema.ObjectId,
        ref: 'Buildings',
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
});
HostSchema.pre('save', function(next) {
    next();
});
HostSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
HostSchema.set('toJSON', {
    transform: function(doc, ret, options) {

        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var HostData = mongoose.model('Hosts', HostSchema);
module.exports = HostSchema;