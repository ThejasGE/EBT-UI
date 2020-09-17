const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const EmployeesSchema = new Schema({
    employeeId: {
        type: String,
        index: true
    },
    email: {
        type: String,
        unique: true,
        index: true
    },
    firstName: {
        type: String,
        index: true
    },
    lastName: {
        type: String,
        index: true
    },
    department: {
        type: String,
        index: true
    },
    shift: {
        type: Schema.ObjectId,
        ref: 'Shift'
    },
    assets: {
        type: [{ type: Schema.ObjectId, ref: 'Asset' }]
    },
    reportingManager: {
        type: Schema.ObjectId,
        ref: 'ReportingManager'
    },
    seatId: {
        type: Schema.ObjectId,
        ref: 'Seats'
    },
    seatType: {
        type: Schema.ObjectId,
        ref: 'SeatType'
    },
    profileImage: {
        type: String,
        index: true
    },
    parkingSpotId: {
        type: Schema.ObjectId,
        ref: 'ParkingSpots'
    },
    lockerId: {
        type: Schema.ObjectId,
        ref: 'Lockers'
    }
});
EmployeesSchema.pre('save', function(next) {
    next();
});
EmployeesSchema.post('save', function(doc, next) {
    console.log("%s is created", doc._id);
    next();
})
EmployeesSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var Employees = mongoose.model('Employees', EmployeesSchema);
module.exports = EmployeesSchema;