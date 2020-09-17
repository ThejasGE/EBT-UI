const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SeatSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts'
    },
    name: {
        type: String,
        index: true
    },
    globalName: {
        type: String
    },
    posX: {
        type: SchemaTypes.Double,
        default: 0.00
    },
    posY: {
        type: SchemaTypes.Double,
        default: 0.00
    },
    width: {
        type: SchemaTypes.Double,
        default: 25
    },
    height: {
        type: SchemaTypes.Double,
        default: 25
    },
    class: {
        type: String,
            default: ''
    },
    rotate: {
        type: SchemaTypes.Double,
        default: 0.00
    },
    seatType: {
        type: SchemaTypes.Double,
        ref: 'SeatType',
        index: true
    }
});
SeatSchema.pre('save', function(next) {
    next();
});
SeatSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
});
SeatSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Seats = mongoose.model('Seats', SeatSchema);
module.exports = SeatSchema;