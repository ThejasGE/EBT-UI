const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const LockerRoomSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'LockerRooms',
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
    }
});
LockerRoomSchema.pre('save', function(next) {
    next();
});
LockerRoomSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
LockerRoomSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var LockerRooms = mongoose.model('LockerRooms', LockerRoomSchema);
module.exports = LockerRoomSchema;