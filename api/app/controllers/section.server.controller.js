var db = require('../../config/mongoose'),
    mongoose = require('mongoose');
var moment = require('moment-timezone');
var padStart = require('string.prototype.padstart');
const hours = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
const stringHours = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"];
const minPulse = 3;
const _10MinCount = 1;
const _1hourCount = 1;
var _ = require('lodash');

exports.getRoomConfig = function(req, res, next) {
    // console.log(db[req.body.subdomain]);
    db[req.body.subdomain].roomToBles.aggregate([{

            $match: {
                floorId: mongoose.Types.ObjectId(req.body.floorId)
            }
        }, {
            $lookup: {
                from: 'sections',
                localField: 'roomId',
                foreignField: '_id',
                as: 'sectionslist'
            }
        }, {
            $unwind: "$sectionslist"
        }, {
            $project: {
                '_id': '$sectionslist._id',
                'floorId': 1,
                'name': '$sectionslist.name',
                'type': 'Square',
                'position': {
                    'x': '$sectionslist.posX',
                    'y': '$sectionslist.posY'
                },
                'updated_at': '$lastUpdated',
                'uuid': '$sectionslist._id'
            }

        }],
        function(err, doc) {

            if (err) {

                res.send({
                    success: false,
                    err: err
                });
            } else {
                var rooms = doc.map(function(item) {
                    // console.log(item);
                    item.created_at = item._id.getTimestamp()
                    return item;
                });
                res.send({
                    success: true,
                    data: rooms
                });
            }

        })

}

exports.getroomOccupancyStatus = function(req, res, next) {

    db[req.body.subdomain].roomToBles.aggregate([{

            $match: {
                roomId: mongoose.Types.ObjectId(req.body.roomId)
            }
        }, {
            $lookup: {
                from: 'sections',
                localField: 'roomId',
                foreignField: '_id',
                as: 'sectionslist'
            }
        }, {
            $unwind: "$sectionslist"
        }, {


            $project: {
                '_id': '$sectionslist._id',
                'roomName': '$sectionslist.name',
                'status': {
                    $cond: {
                        if: {
                            $gte: ["$peopleCount", 1]
                        },
                        then: true,
                        else: false
                    }
                }
            }


        }],
        function(err, doc) {

            if (err) {

                res.send({
                    success: false,
                    err: err
                });
            } else {
                res.send({
                    success: true,
                    data: doc
                });
            }

        })

}

exports.getroomUsage = function(req, res, next) {

    var floorId = mongoose.Types.ObjectId(req.body.floorId);
    var startDate = new Date(req.body.startTime),
        endDate = new Date(req.body.endTime),
        syear = startDate.getFullYear(),
        smonth = padStart(startDate.getMonth() + 1, 2, '0'),
        sday = padStart(startDate.getDate(), 2, '0'),
        eyear = endDate.getFullYear(),
        emonth = padStart(endDate.getMonth() + 1, 2, '0'),
        eday = padStart(endDate.getDate(), 2, '0');
    var floorData = {};
    db[req.body.subdomain].buildings.findOne({
        floors: {
            $in: [floorId]
        }
    }, function(err, building) {
        if (building) {
            var dayStartIST = moment.tz(syear + '-' + smonth + '-' + sday + 'T00:00:00', building.timezone).unix() * 1000;
            var dayEndIST = moment.tz(eyear + '-' + emonth + '-' + eday + 'T23:59:59', building.timezone).unix() * 1000;
            var dayStart = new Date(dayStartIST);
            var dayEnd = new Date(dayEndIST);
            db[req.body.subdomain].roomToBles.find({
                floorId: floorId
            }, 'peopleCount bleId roomId', {
                sort: 'roomId'
            }).lean().populate({
                path: 'roomId',
                select: 'name',
                match: {
                    name: /^(?!Flap).*$/
                }
            }).exec(function(err, rooms) {
                if (err)
                    res.status(400).json(err);
                else if (rooms.length) {
                    var bleIds = rooms.map(function(room) {
                        return room.bleId;
                    });
                    // console.log(bleIds);
                    meetingRoomUsage(bleIds, dayStart, dayEnd, building.timezoneOffset, req.body.subdomain, function(roomData) {
                        var roomUsage = [];

                        // console.log(JSON.stringify(roomData));
                        rooms.forEach(function(room) {
                            if (room.roomId) {
                                roomUsage.push({
                                    roomName: room.roomId.name,
                                    peopleCount: room.peopleCount,
                                    averagePeopleCount: roomData[room.bleId] ? (roomData[room.bleId] > 12 ? (roomData[room.bleId] % 7) : roomData[room.bleId]) : 0
                                });
                                // used.push(roomData[room.bleId] ? (roomData[room.bleId] > 12 ? (roomData[room.bleId] % 7) : roomData[room.bleId]) : 0);
                            }
                        });
                        floorData = {
                            'roomUsage': roomUsage

                        };
                        res.json({
                            success: true,
                            data: floorData
                        });
                    });
                } else
                    res.json({
                        success: false,
                        "roomUsage": "[]"

                    });
            });
        } else {
            res.json({
                success: false,
                "roomUsage": "[]"
            });
        }
    });

}

exports.availableRooms = function(req, res, next) {
    var floorId = mongoose.Types.ObjectId(req.body.floorId);
    db[req.body.subdomain].roomToBles.find({
        $and: [{
            floorId: floorId,
            peopleCount: {
                $eq: 0
            }
        }]
    }, 'roomId', {
        sort: 'roomId'
    }).lean().populate({
        path: 'roomId',
        select: 'name',
        match: {
            name: /^(?!Flap).*$/
        }
    }).exec(function(err, rooms) {
        var availableRooms = []
        rooms.forEach(function(room) {
            availableRooms.push(room.roomId);
        });
        res.send({
            success: true,
            data: availableRooms
        })
    })

}


const meetingRoomUsage = function(bleIds, dayStart, dayEnd, timezoneOffset, domain, callback) {
    var counter = 0;
    var pending = bleIds.length;
    // console.log(bleIds)
    // console.log(bleIds.length, dayStart, dayEnd, timezoneOffset)
    var roomData = {};
    db[domain].sensorDatas.aggregate([{
            $match: {
                sensorId: {
                    $in: bleIds
                },
                time: {
                    $gte: dayStart,
                    $lte: dayEnd
                },
                density: {
                    $gt: 0
                }
            }
        },
        {
            $project: {
                interval: {
                    $dateToString: {
                        format: "%H",
                        date: {
                            $add: ["$time", timezoneOffset]
                        }
                    }
                },
                density: 1,
                sensorId: 1
            }
        },
        {
            $group: {
                _id: {
                    interval: "$interval",
                    sensorId: "$sensorId"
                },
                count: {
                    $sum: 1
                }
            }
        },
        {
            $match: {
                count: {
                    $gte: 1
                }
            }
        },
        {
            $project: {
                interval: "$_id.interval",
                sensorId: "$_id.sensorId"
            }
        },
        {
            $group: {
                _id: "$sensorId",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                sensorId: "$_id",
                count: "$count"
            }
        }
    ], function(err, result) {
        // console.log('result ', result)
        result.forEach(function(room) {
            roomData[room.sensorId] = room.count;
        });
        //console.log(roomData)
        callback(roomData);
    });
};