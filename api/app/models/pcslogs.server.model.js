const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PcsLogsSchema = new Schema({
    bleId: {
        type: Schema.ObjectId,
        index: true
    },
    lastUpdated: {
        type: String
    },
    floors: {
        type: String
    },
    customers: {
        type: String
    },
    buildings: {
        type: String
    },
    bleaddress: {
        type: String
    },
    areaName: {
        type: String,
        index: true
    },
    noOfResponses: {
        type: Number
    },
    subject: {
        type: String
    },
    comments: {
        type: String
    },
    time: {
        type: Date,
        index: true
    },
    resolved:{
        type: Boolean
    },
    resolvedTime:{
        type: Date,
        index: true
    }


});
PcsLogsSchema.index({ bleId: 1, roomName: 1, bleId: 1,time: 1, resolvedTime: 1 });
PcsLogsSchema.pre('save', function(next) {
    next();
});
PcsLogsSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
PcsLogsSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var pcslogs = mongoose.model('pcsbleissues', PcsLogsSchema);
module.exports = PcsLogsSchema;