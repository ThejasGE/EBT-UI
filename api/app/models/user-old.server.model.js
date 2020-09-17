const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        index: true
    },
    accessibleLocation: {
        type: [{ type: Schema.ObjectId, ref: 'Buildings' }]
    },
    isActive: {
        type: Boolean,
        default: false
    },
    reportPriority: {
        type: Number,
        default: 0
    },
    emailPriority: {
        type: Number,
        default: 0
    }
})
UserSchema.pre('save', function(next) {
    next();
});
UserSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
});
UserSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var User = mongoose.model('User', UserSchema);
module.exports = UserSchema;