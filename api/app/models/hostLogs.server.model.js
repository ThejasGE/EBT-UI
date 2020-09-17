const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const HostLogSchema = new Schema({
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts',
        index: true
    },
    lastUpdated: {
        type: Date,
        index: true
    }
});
HostLogSchema.index({ hostId: 1, lastUpdated: 1 });
HostLogSchema.pre('save', function(next) {
    next();
});
HostLogSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
HostLogSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var HostData = mongoose.model('HostLogs', HostLogSchema);
module.exports = HostLogSchema;