const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const SchedulerSchema = new Schema({
    name: {
        type: String,
        index: true
    },
    sTime: {
        type: String,
        index: true
    },
    eTime: {
        type: String,
        index: true
    },
    ladLights: {
        type: [{
            address: {
                type: String
            },
            parent: {   
                type: Number
            },
            child: {
                type: Number
            },
            dimLevel: {
                type: Number
            }
        }],
        index: true
    },
    relayLights: {
        type: [{
            command: {
                type: String
            },
            parent: {
                type: Number
            },
            child: {
                type: Number
            }
        }],
        index: true
    },
    days: { type: [{ type: Number }] }
});
SchedulerSchema.pre('save', function(next) {
    next();
});
SchedulerSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
var Schedulers = mongoose.model('scheduler', SchedulerSchema);
module.exports = SchedulerSchema;