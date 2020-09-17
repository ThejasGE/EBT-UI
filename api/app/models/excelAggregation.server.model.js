const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaTypes = Schema.Types;

const ExcelAggSchema = new Schema({
    Country: {
        type: String
    },
    Region: {
        type: String
    },
    Location: {
        type: String
    },
    "Resource Type": {
        type: String
    },
    day: {
        type: String,
        index: true
    },
    floor: {
        type: String,
        index: true
    },
    Department: {
        type: String
    },
    seatName: {
        type: String,
        index: true
    },
    done: {
        type: Boolean
    },
    "00:00": {
        type: Number
    },
    "00:10": {
        type: Number
    },
    "00:20": {
        type: Number
    },
    "00:30": {
        type: Number
    },
    "00:40": {
        type: Number
    },
    "00:50": {
        type: Number
    },
    "01:00": {
        type: Number
    },
    "01:10": {
        type: Number
    },
    "01:20": {
        type: Number
    },
    "01:30": {
        type: Number
    },
    "01:40": {
        type: Number
    },
    "01:50": {
        type: Number
    },
    "02:00": {
        type: Number
    },
    "02:10": {
        type: Number
    },
    "02:20": {
        type: Number
    },
    "02:30": {
        type: Number
    },
    "02:40": {
        type: Number
    },
    "02:50": {
        type: Number
    },
    "03:00": {
        type: Number
    },
    "03:10": {
        type: Number
    },
    "03:20": {
        type: Number
    },
    "03:30": {
        type: Number
    },
    "03:40": {
        type: Number
    },
    "03:50": {
        type: Number
    },
    "04:00": {
        type: Number
    },
    "04:10": {
        type: Number
    },
    "04:20": {
        type: Number
    },
    "04:30": {
        type: Number
    },
    "04:40": {
        type: Number
    },
    "04:50": {
        type: Number
    },
    "05:00": {
        type: Number
    },
    "05:10": {
        type: Number
    },
    "05:20": {
        type: Number
    },
    "05:30": {
        type: Number
    },
    "05:40": {
        type: Number
    },
    "05:50": {
        type: Number
    },
    "06:00": {
        type: Number
    },
    "06:10": {
        type: Number
    },
    "06:20": {
        type: Number
    },
    "06:30": {
        type: Number
    },
    "06:40": {
        type: Number
    },
    "06:50": {
        type: Number
    },
    "07:00": {
        type: Number
    },
    "07:10": {
        type: Number
    },
    "07:20": {
        type: Number
    },
    "07:30": {
        type: Number
    },
    "07:40": {
        type: Number
    },
    "07:50": {
        type: Number
    },
    "08:00": {
        type: Number
    },
    "08:10": {
        type: Number
    },
    "08:20": {
        type: Number
    },
    "08:30": {
        type: Number
    },
    "08:40": {
        type: Number
    },
    "08:50": {
        type: Number
    },
    "09:00": {
        type: Number
    },
    "09:10": {
        type: Number
    },
    "09:20": {
        type: Number
    },
    "09:30": {
        type: Number
    },
    "09:40": {
        type: Number
    },
    "09:50": {
        type: Number
    },
    "10:00": {
        type: Number
    },
    "10:10": {
        type: Number
    },
    "10:20": {
        type: Number
    },
    "10:30": {
        type: Number
    },
    "10:40": {
        type: Number
    },
    "10:50": {
        type: Number
    },
    "11:00": {
        type: Number
    },
    "11:10": {
        type: Number
    },
    "11:20": {
        type: Number
    },
    "11:30": {
        type: Number
    },
    "11:40": {
        type: Number
    },
    "11:50": {
        type: Number
    },
    "12:00": {
        type: Number
    },
    "12:10": {
        type: Number
    },
    "12:20": {
        type: Number
    },
    "12:30": {
        type: Number
    },
    "12:40": {
        type: Number
    },
    "12:50": {
        type: Number
    },
    "13:00": {
        type: Number
    },
    "13:10": {
        type: Number
    },
    "13:20": {
        type: Number
    },
    "13:30": {
        type: Number
    },
    "13:40": {
        type: Number
    },
    "13:50": {
        type: Number
    },
    "14:00": {
        type: Number
    },
    "14:10": {
        type: Number
    },
    "14:20": {
        type: Number
    },
    "14:30": {
        type: Number
    },
    "14:40": {
        type: Number
    },
    "14:50": {
        type: Number
    },
    "15:00": {
        type: Number
    },
    "15:10": {
        type: Number
    },
    "15:20": {
        type: Number
    },
    "15:30": {
        type: Number
    },
    "15:40": {
        type: Number
    },
    "15:50": {
        type: Number
    },
    "16:00": {
        type: Number
    },
    "16:10": {
        type: Number
    },
    "16:20": {
        type: Number
    },
    "16:30": {
        type: Number
    },
    "16:40": {
        type: Number
    },
    "16:50": {
        type: Number
    },
    "17:00": {
        type: Number
    },
    "17:10": {
        type: Number
    },
    "17:20": {
        type: Number
    },
    "17:30": {
        type: Number
    },
    "17:40": {
        type: Number
    },
    "17:50": {
        type: Number
    },
    "18:00": {
        type: Number
    },
    "18:10": {
        type: Number
    },
    "18:20": {
        type: Number
    },
    "18:30": {
        type: Number
    },
    "18:40": {
        type: Number
    },
    "18:50": {
        type: Number
    },
    "19:00": {
        type: Number
    },
    "19:10": {
        type: Number
    },
    "19:20": {
        type: Number
    },
    "19:30": {
        type: Number
    },
    "19:40": {
        type: Number
    },
    "19:50": {
        type: Number
    },
    "20:00": {
        type: Number
    },
    "20:10": {
        type: Number
    },
    "20:20": {
        type: Number
    },
    "20:30": {
        type: Number
    },
    "20:40": {
        type: Number
    },
    "20:50": {
        type: Number
    },
    "21:00": {
        type: Number
    },
    "21:10": {
        type: Number
    },
    "21:20": {
        type: Number
    },
    "21:30": {
        type: Number
    },
    "21:40": {
        type: Number
    },
    "21:50": {
        type: Number
    },
    "22:00": {
        type: Number
    },
    "22:10": {
        type: Number
    },
    "22:20": {
        type: Number
    },
    "22:30": {
        type: Number
    },
    "22:40": {
        type: Number
    },
    "22:50": {
        type: Number
    },
    "23:00": {
        type: Number
    },
    "23:10": {
        type: Number
    },
    "23:20": {
        type: Number
    },
    "23:30": {
        type: Number
    },
    "23:40": {
        type: Number
    },
    "23:50": {
        type: Number
    },
});
ExcelAggSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
var ExcelAgg = mongoose.model('ExcelAggregation', ExcelAggSchema);
module.exports = ExcelAggSchema;