const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const ShiftSchema = new Schema({
    startTime: {
        type: String,
        index: true
    },
    endTime: {
        type: String,
        index: true
    }
});
ShiftSchema.pre('save', function(next) {
    next();
});
ShiftSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
ShiftSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Shift = mongoose.model('Shift', ShiftSchema);
module.exports = ShiftSchema;