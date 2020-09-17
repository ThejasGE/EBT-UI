var db = require('../../config/mongoose');
var mongoose = require('mongoose');
var moment = require('moment-timezone');
var padStart = require('string.prototype.padstart');
const hours = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
const stringHours = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];
const minPulse = 3;
const _10MinCount = 1;
const _1hourCount = 1;
var _ = require('lodash');


exports.getseatConfig = function(req, res, next) {

    db[req.body.subdomain].seatses.aggregate(
        [{
                $match: {
                    "floorId": mongoose.Types.ObjectId(req.body.floorId)
                }
            },
            {
                $lookup: {
                    from: "sensortobles",
                    localField: "_id",
                    foreignField: "seatId",
                    as: "sensortobles"
                }
            },
            {
                $unwind: "$sensortobles"
            },
            {
                $lookup: {
                    from: "seattypes",
                    localField: "seatType",
                    foreignField: "_id",
                    as: "seattype"
                }
            },
            {
                $unwind: "$seattype"
            },
            {
                $project: {
                    "_id": 1,
                    "floorId": 1,
                    "name": 1,
                    "type": "$seattype.name",
                    "position": {
                        "x": "$posX",
                        "y": "$posY"
                    },
                    "updated_at": "$sensortobles.lastStatusUpdate",
                    "uuid": "$_id"

                }
            }

        ],
        function(err, doc) {

            if (err) {

                res.send({
                    success: false,
                    err: err
                });
            } else {
                var seats = doc.map(function(item) {
                    item.created_at = item._id.getTimestamp()
                    return item;
                });
                res.send({
                    success: true,
                    data: seats
                });
            }

        })
}

exports.getoccupancy = function(req, res, next) {

    db[req.body.subdomain].seatses.aggregate(
        [{
                $match: {
                    "floorId": mongoose.Types.ObjectId(req.body.floorId)
                }
            },
            {
                $lookup: {
                    from: "sensortobles",
                    localField: "_id",
                    foreignField: "seatId",
                    as: "sensortobles"
                }
            },
            {
                $unwind: "$sensortobles"
            },
            {
                $lookup: {
                    from: "bles",
                    localField: "sensortobles.bleId",
                    foreignField: "_id",
                    as: "bles"
                }
            },
            {
                $unwind: "$bles"
            },
            {
                $project: {
                    "_id": '$sensortobles._id',
                    "floorId": 1,
                    "sensorId": "$bles._id",
                    "seatId": '$_id',
                    "updated_at": "$sensortobles.lastStatusUpdate",
                    "lastOccupied": '$sensortobles.lastOccupied',
                    "status": '$sensortobles.status',
                    "occupied": '$sensortobles.occupied'

                }
            }

        ],
        function(err, doc) {

            if (err) {

                res.send({
                    success: false,
                    err: err
                });
            } else {
                var seats = doc.map(function(item) {
                    item.created_at = item._id.getTimestamp()
                    return item;
                });
                res.send({
                    success: true,
                    data: seats
                });
            }

        })

}

exports.getoccupancyCount = function(req, res, next) {

    db[req.body.subdomain].seatses.aggregate(
        [{
                $match: {
                    "floorId": mongoose.Types.ObjectId(req.body.floorId)
                }
            },
            {
                $lookup: {
                    from: "sensortobles",
                    localField: "_id",
                    foreignField: "seatId",
                    as: "sensortobles"
                }
            },
            {
                $unwind: "$sensortobles"
            },
            {
                $lookup: {
                    from: "bles",
                    localField: "sensortobles.bleId",
                    foreignField: "_id",
                    as: "bles"
                }
            },
            {
                $unwind: "$bles"
            },
            {
                $count: "occupancyCount"
            }

        ],
        function(err, doc) {
            // console.log(doc)
            if (err) {

                res.send({
                    success: false,
                    err: err
                });
            } else {

                res.send({
                    success: true,
                    occupancyCount: doc[0].occupancyCount
                });
            }

        })

}


exports.getoccupancyAggregation = function(req, res, next) {

    // console.log(db[req.body.subdomain]);

    var startDate = new Date(req.body.startTime),
        endDate = new Date(req.body.endTime),
        syear = startDate.getFullYear(),
        smonth = padStart(startDate.getMonth() + 1, 2, '0'),
        sday = padStart(startDate.getDate(), 2, '0'),
        eyear = endDate.getFullYear(),
        emonth = padStart(endDate.getMonth() + 1, 2, '0'),
        eday = padStart(endDate.getDate(), 2, '0');
    // console.log(smonth);

    db[req.body.subdomain].buildings.findOne({
        floors: {
            $in: [req.body.floorId]
        }
    }, function(err, building) {
        if (building) {
            var dayStartIST = moment.tz(syear + '-' + smonth + '-' +
                sday + 'T00:00:00', building.timezone).unix() * 1000;
            var dayEndIST = moment.tz(eyear + '-' + emonth + '-' +
                eday + 'T23:59:59', building.timezone).unix() * 1000;
            var dayStart = new Date(dayStartIST);
            var dayEnd = new Date(dayEndIST);
            db[req.body.subdomain].sensorToBles.find({
                floorId: req.body.floorId
            }, 'seatId bleId', {
                sort: 'seatId'
            }).lean().populate({
                path: 'seatId',
                select: 'name globalName'
            }).exec(function(err, seats) {
                if (err)
                    res.status(400).json(err);
                else if (seats) {
                    var bleIds = seats.map(function(seat) {
                        return seat.bleId;
                    });
                    getSeatUtilisation(seats, bleIds, dayStart, dayEnd, building.timezoneOffset, req.body.subdomain, function(seatUtil) {
                        res.json({ success: true, data: seatUtil });
                    });
                } else
                    res.json({
                        success: false,
                        data: []
                    });
            });
        } else
            res.json({
                success: false,
                data: []
            });
    });


};

exports.getoccupancyPattern = function(req, res, next) {

    var data = req.body;
    var occupancyData = [];
    var occData = {};
    occData.occupancyPattern = [];
    var startDate = new Date(req.body.startTime),
        endDate = new Date(req.body.endTime),
        syear = startDate.getFullYear(),
        smonth = padStart(startDate.getMonth() + 1, 2, '0'),
        sday = padStart(startDate.getDate(), 2, '0'),
        eyear = endDate.getFullYear(),
        emonth = padStart(endDate.getMonth() + 1, 2, '0'),
        eday = padStart(endDate.getDate(), 2, '0');
    db[data.subdomain].buildings.findById(req.body.buildingId).lean().populate({
        path: "floors",
        select: 'name alias _id'
    }).exec(function(err, building) {
        var dayStart = moment.tz(syear + '-' + smonth + '-' + sday + 'T00:00:00', building.timezone).unix() * 1000;
        var dayEnd = moment.tz(eyear + '-' + emonth + '-' + eday + ' 23:59:59', building.timezone).unix() * 1000;
        var noOfDays = Math.ceil(moment.duration((dayEnd + 1000) - dayStart).asDays());
        var difference = Math.ceil(moment.duration((dayEnd + 1000) - dayStart).asDays());
        var format;
        var formatH = '%d-%m-%Y %H';
        if (difference == 1)
            format = '%H';
        else {
            format = '%d-%m-%Y';
        }
        var counter = 0;
        var pending = building.floors.length;
        building.floors.forEach(function(floor) {
            db[data.subdomain].sensorToBles.find({
                floorId: floor._id
            }, "bleId -_id", function(err, bles) {
                var bleIds = bles.map(function(ble) {
                    return ble.bleId;
                });
                //console.log(bleIds)
                getOccupancyPatternNew(bleIds, dayStart, dayEnd, noOfDays, building.timezoneOffset, format, data.subdomain, function(occupancyPattern) {
                    var temp = {};
                    temp.name = floor.alias;
                    temp.totalSeats = bleIds.length;
                    temp.values = occupancyPattern.values;
                    occData.labels = occupancyPattern.labels;
                    occData.occupancyPattern.push(temp);
                    // occData.occupancyPattern.push(occupancyPattern);
                    if (++counter == pending) {
                        var buildingAverage = _.fill(new Array(occData.labels.length), 0);
                        var tempBuildingAverage = _.fill(new Array(occData.labels.length), 0);
                        var totalBuildingSeats = 0;
                        var totalBuildingAverage = 0;
                        //console.log(average, floorSum)
                        var totalWeekdays = 0;
                        for (var i = 0; i < occData.occupancyPattern.length; i++) {
                            totalWeekdays = 0;
                            for (var j = 0; j < buildingAverage.length; j++) {
                                if (noOfDays > 1) {
                                    var dayOfWeek = moment(occData.labels[j].split("-").reverse().join('')).isoWeekday();
                                    if (dayOfWeek < 6) {
                                        tempBuildingAverage[j] += occData.occupancyPattern[i]['values'][j];
                                        totalWeekdays++;
                                    } else {
                                        tempBuildingAverage[j] += 0;
                                    }
                                    buildingAverage[j] += occData.occupancyPattern[i]['values'][j];
                                } else {
                                    tempBuildingAverage[j] += occData.occupancyPattern[i]['values'][j];
                                    buildingAverage[j] += occData.occupancyPattern[i]['values'][j];
                                }
                            }
                            totalBuildingSeats += occData.occupancyPattern[i]['totalSeats'];
                            /*occData.occupancyPattern[i]['maxValue'] = _.max(occData.occupancyPattern[i]['values'])
                            occData.occupancyPattern[i]['minValue'] = Math.min.apply(null, occData.occupancyPattern[i]['values'].filter(Boolean));*/
                        }
                        tempBuildingAverage.forEach(function(building) {
                            totalBuildingAverage += building;
                        });
                        occData.maxBuildingOccupancy = _.max(tempBuildingAverage);
                        occData.maxBuildingOccupancyTime = occData.labels[_.indexOf(tempBuildingAverage, occData.maxBuildingOccupancy, 0)];
                        occData.minBuildingOccupancy = Math.min.apply(null, tempBuildingAverage.filter(Boolean));
                        occData.minBuildingOccupancyTime = occData.labels[_.indexOf(tempBuildingAverage, occData.minBuildingOccupancy, 0)];
                        occData.minBuildingOccupancy = occData.minBuildingOccupancyTime ? occData.minBuildingOccupancy : 0;
                        occData.minBuildingOccupancyTime = occData.minBuildingOccupancyTime ? occData.minBuildingOccupancyTime : occData.labels[0];
                        occData.maxBuildingOccupancyPercent = parseFloat(((occData.maxBuildingOccupancy / totalBuildingSeats) * 100).toFixed(1));
                        occData.minBuildingOccupancyPercent = parseFloat(((occData.minBuildingOccupancy / totalBuildingSeats) * 100).toFixed(1));
                        occData.totalBuildingSeats = totalBuildingSeats;
                        occData.totalBuildingAverage = Math.floor(totalBuildingAverage / totalWeekdays);
                        //console.log(occData.minBuildingOccupancy)
                        temp = {};
                        temp.name = "Building Average";
                        temp.totalSeats = totalBuildingSeats;
                        temp.values = buildingAverage;
                        occData.occupancyPattern.push(temp);

                        res.json({
                            success: true,
                            labels: occData.labels,
                            seatCount: temp.values
                        });
                    }
                });
            });
        });
    });

}

exports.getavailableSeats = function(req, res, next) {
    db[req.body.subdomain].seatses.aggregate(
        [{
                $match: {
                    "floorId": mongoose.Types.ObjectId(req.body.floorId)
                }
            },
            {
                $lookup: {
                    from: "sensortobles",
                    localField: "_id",
                    foreignField: "seatId",
                    as: "sensortobles"
                }
            },
            {
                $unwind: "$sensortobles"
            },
            {
                $project: {
                    '_id': '$_id',
                    'seatName': {
                        $cond: {
                            if: {
                                $eq: ["$sensortobles.occupied", false]
                            },
                            then: "$name",
                            else: false
                        }
                    }

                }
            }

        ],
        function(err, doc) {

            if (err) {

                res.send({
                    success: false,
                    err: err
                });
            } else {
                var seats = [];
                doc.forEach(function(item) {
                    if (item.seatName !== false) {
                        seats.push(item)
                    }
                });
                res.send({
                    success: true,
                    data: seats
                });
            }

        })

}

const getSeatUtilisation = function(seats, bleIds, dayStart, dayEnd, timezoneOffset, domain, callback) {
    db[domain].sensorDatas.aggregate(
        [{
                $match: {
                    $and: [{
                        sensorId: {
                            $in: bleIds
                        }
                    }, {
                        $and: [{
                            time: {
                                $gte: dayStart
                            }
                        }, {
                            time: {
                                $lte: dayEnd
                            }
                        }]
                    }, {
                        occupancy: {
                            $gt: 0
                        }
                    }]
                }
            },
            {
                $project: {
                    occupancy: 1,
                    sensorId: 1,
                    day: {
                        $dateToString: {
                            format: '%d-%m-%Y',
                            date: {
                                $add: ["$time", timezoneOffset]
                            }
                        }
                    },
                    hour: {
                        $hour: {
                            $add: ["$time", timezoneOffset]
                        }
                    },
                    minute: {
                        $subtract: [{
                            $minute: {
                                $add: ["$time", timezoneOffset]
                            }
                        }, {
                            $mod: [{
                                $minute: {
                                    $add: ["$time", timezoneOffset]
                                }
                            }, 10]
                        }]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        sensorId: "$sensorId",
                        day: "$day",
                        hour: "$hour",
                        minute: "$minute"
                    },
                    total: {
                        $sum: "$occupancy"
                    }
                }
            },
            {
                $match: {
                    total: {
                        $gte: minPulse
                    }
                }
            }, //Filter for false triggers, so occupied for more than 5 minutes in 10 minute interval
            {
                $project: {
                    day: "$_id.day",
                    hour: "$_id.hour",
                    total: 1,
                    sensorId: "$_id.sensorId",
                    _id: 0
                }
            },
            {
                $group: {
                    _id: {
                        sensorId: "$sensorId",
                        day: "$day",
                        hour: "$hour"
                    },
                    total: {
                        $sum: 1
                    }
                }
            }, //number of 10 minute intervals occupied in an hour
            {
                $match: {
                    total: {
                        $gte: _10MinCount
                    }
                }
            },
            {
                $project: {
                    day: "$_id.day",
                    total: 1,
                    sensorId: "$_id.sensorId",
                    _id: 0
                }
            },
            {
                $group: {
                    _id: {
                        sensorId: "$sensorId",
                        day: "$day"
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $match: {
                    count: {
                        $gte: _1hourCount
                    }
                }
            },
            {
                $project: {
                    count: 1,
                    sensorId: "$_id.sensorId",
                    _id: 0
                }
            },
            {
                $group: {
                    _id: {
                        sensorId: "$sensorId"
                    },
                    averageCount: {
                        $avg: "$count"
                    }
                }
            },
            {
                $project: {
                    averageCount: 1,
                    sensorId: "$_id.sensorId",
                    _id: 0
                }
            },
        ],
        function(err, data) {
            if (data) {
                var seatUsedAggregationList = [];

                seats.forEach(function(seat) {
                    if (seat.seatId) {


                        var obj = _.find(data, {
                            "sensorId": seat.bleId
                        });

                        if (obj) {
                            var tmp = parseInt(obj.averageCount);
                            seatUsedAggregationList.push({
                                "_id": seat.bleId,
                                "seatName": seat.seatId.globalName ? seat.seatId.globalName : seat.seatId.name,
                                "hoursUsed": tmp
                            })

                        } else {
                            seatUsedAggregationList.push({
                                "_id": seat.bleId,
                                "seatName": seat.seatId.globalName ? seat.seatId.globalName : seat.seatId.name,
                                "hoursUsed": 0
                            })
                        }
                    }
                });
                callback({
                    used: seatUsedAggregationList
                });
            } else {
                callback([]);
            }
        });
};


const getOccupancyPatternNew = function(bleIds, dayStart, dayEnd, noOfDays, timezoneOffset, format, domain, callback) {
    // console.log(format);
    db[domain].sensorDatas.aggregate([{
            $match: {
                sensorId: {
                    $in: bleIds
                },
                time: {
                    $gte: new Date(dayStart),
                    $lte: new Date(dayEnd)
                },
                occupancy: {
                    $gt: 0
                }
            }
        },
        {
            $project: {
                occupancy: 1,
                sensorId: 1,
                interval: {
                    $dateToString: {
                        format: format,
                        date: {
                            $add: ["$time", timezoneOffset]
                        }
                    }
                },
                day: {
                    $dateToString: {
                        format: '%d-%m-%Y',
                        date: {
                            $add: ["$time", timezoneOffset]
                        }
                    }
                },
                hour: {
                    $hour: {
                        $add: ["$time", timezoneOffset]
                    }
                },
                minute: {
                    $subtract: [{
                        $minute: {
                            $add: ["$time", timezoneOffset]
                        }
                    }, {
                        $mod: [{
                            $minute: {
                                $add: ["$time", timezoneOffset]
                            }
                        }, 10]
                    }]
                }
            }
        },
        {
            $group: {
                _id: {
                    sensorId: "$sensorId",
                    day: "$day",
                    hour: "$hour",
                    minute: "$minute"
                },
                total: {
                    $sum: "$occupancy"
                },
                interval: {
                    $first: "$interval"
                }
            }
        },
        {
            $match: {
                total: {
                    $gte: minPulse
                }
            }
        }, //Filter for false triggers, so occupied for more than 5 minutes in 10 minute interval
        {
            $project: {
                day: "$_id.day",
                hour: "$_id.hour",
                total: 1,
                sensorId: "$_id.sensorId",
                interval: 1,
                minute: "$_id.minute",
                _id: 0
            }
        },
        {
            $group: {
                _id: {
                    sensorId: "$sensorId",
                    day: "$day",
                    hour: "$hour"
                },
                total: {
                    $sum: 1
                },
                interval: {
                    $first: "$interval"
                }
            }
        }, //number of 10 minute intervals occupied in an hour
        {
            $match: {
                total: {
                    $gte: _10MinCount
                }
            }
        }, // occupied for atleast one 10 minute interval
        {
            $project: {
                day: "$_id.day",
                hour: "$_id.hour",
                total: 1,
                sensorId: "$_id.sensorId",
                interval: 1,
                _id: 0
            }
        },
        {
            $group: {
                _id: {
                    sensorId: "$sensorId",
                    day: "$day",
                    interval: "$interval"
                },
                total: {
                    $sum: 1
                }
            }
        },
        {
            $match: {
                total: {
                    $gte: _1hourCount
                }
            }
        },
        {
            $project: {
                day: "$_id.day",
                total: 1,
                sensorId: "$_id.sensorId",
                interval: "$_id.interval",
                _id: 0
            }
        },
        {
            $group: {
                _id: "$interval",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                interval: "$_id",
                count: "$count"
            }
        },
        {
            $sort: {
                interval: 1
            }
        }
    ]).allowDiskUse(true).exec(function(err, result) {
        // console.log(result.length);
        // callback(result);
        if (noOfDays == 1) {
            callback(getHourlyData(result));
        } else {
            callback(getDailyData(result, noOfDays, dayStart, timezoneOffset));
        }
    });
};


const getHourlyData = function(data) {
    var temp;
    var hourlyData = {};
    hourlyData.labels = [];
    hourlyData.values = [];
    for (var i = 0; i < hours.length; i++) {
        temp = _.find(data, {
            'interval': hours[i]
        });
        if (temp) {
            hourlyData.values.push(temp.count);
        } else {
            hourlyData.values.push(0);
        }
        hourlyData.labels.push(stringHours[i]);
    }
    return hourlyData;
};
const getDailyData = function(data, noOfDays, dayStart, timezoneOffset) {
    var difference = noOfDays;
    var utcOffset = parseInt(timezoneOffset / 60000);
    var date = moment(dayStart).utcOffset(utcOffset);
    var dailyData = {};
    dailyData.labels = [];
    dailyData.values = [];
    while (difference) {
        var now = date.format("DD-MM-YYYY");
        temp = _.find(data, {
            'interval': now
        });
        if (temp) {
            dailyData.values.push(temp.count);
        } else {
            dailyData.values.push(0);
        }
        dailyData.labels.push(now);
        date.add(1, 'days');
        difference--;
    }
    return dailyData;
};