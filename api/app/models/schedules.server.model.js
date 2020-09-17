const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const ScheduleSchema = new Schema({
    floorId: {
        type: Schema.ObjectId,
        ref: 'Floors',
        index: true
    },
    hostId: {
        type: Schema.ObjectId,
        ref: 'Hosts'
    },
    zoneId: {
        type: Schema.ObjectId,
        ref: 'Zones'
    },
    name: {
        type: String,
        index: true
    },
    //Stored in number of seconds since midnight
    startTime: {
        type: Number,
        index: true
    },
    //Stored in number of seconds since midnight
    endTime: {
        type: Number,
        index: true
    },
    // stored as 0- Sunday, 1 - Monday .... 6 - Saturday
    days: {
        type: [
            { type: Number }
        ]
    }
})
ScheduleSchema.pre('save', function(next) {
    next();
});
ScheduleSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
var Schedules = mongoose.model('Schedules', ScheduleSchema);
module.exports = ScheduleSchema;