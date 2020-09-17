const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const DummyDataSchema = new Schema({
    name: {
        type: String,
        index: true
    },
    temperature: {
        type: SchemaTypes.Double,
        default: 0.00,
        index: true
    },
});
DummyDataSchema.pre('save', function(next) {
    next();
});
DummyDataSchema.post('save', function(doc, next) {
    next();
})
DummyDataSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var DummyData = mongoose.model('dummy', DummyDataSchema);
module.exports = DummyDataSchema;