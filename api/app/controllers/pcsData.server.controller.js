var db = require('../../config/mongoose'),
    jwt = require('jsonwebtoken');
var moment = require('moment-timezone');
var _ = require('lodash');
const cron = require("node-cron");

// const Moment = require('moment')
const MomentRange = require('moment-range');
const momentrange = MomentRange.extendMoment(moment);

var mongoose = global.mongoose;
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) { s = "0" + s; }
    return s;
};
const redis = require('redis');
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient({ port: REDIS_PORT, detect_buffers: true });
client.on("error", function(err) {
    console.log("Error " + err);
})

exports.getPcsDatasCache = async(req, res, next) => {
    try {
        let obj = req.body;
        let df = new Date(obj.FromDate),
            dt = new Date(obj.ToDate);
        client.lrange(`getPcsDatas-${obj.subdomain}-${df.getDate()  }-${dt.getDate()}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err, "not cached so Orginal Request getPcsDatas", obj.subdomain)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getPcsDatas = async function(req, res, next) {
    try {
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
        });
        let multi = client.multi();
        const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
        let pass = result.password === objC.password;
        if (pass == true) {
            let Buildings = result.Buildings;
            var count = 0;
            var sendArray = [];
            let obj = req.body;
            var dates = req.body;
            var bu = ['SGP-MBFC', 'Barclays Japan'];
            let blesLook = { $lookup: { from: "bles", localField: "bleId", foreignField: "_id", as: "bles_docs" } },
                blesUnwind = { $unwind: "$bles_docs" };
            let floorLook = { $lookup: { from: "floors", localField: "floorId", foreignField: "_id", as: "floors_docs" } },
                floorUnwind = { $unwind: "$floors_docs" };
            let buildLook = { $lookup: { from: "buildings", localField: "floors_docs.buildingId", foreignField: "_id", as: "building_docs" } },
                buildUnwind = { $unwind: "$building_docs" };
            let hostLook = { $lookup: { from: "hosts", localField: "bles_docs.hostId", foreignField: "_id", as: "host_docs" } },
                hostUnwind = { $unwind: "$host_docs" };
            let segmentLook = { $lookup: { from: "segments", localField: "segmentId", foreignField: "_id", as: "segments_docs" } },
                segmentUnwind = { $unwind: "$segments_docs" };
            let sectionLook = { $lookup: { from: "sections", localField: "roomId", foreignField: "_id", as: "sections_docs" } },
                sectionsUnwind = { $unwind: "$sections_docs" };

            let Group = {
                $group: {
                    _id: "$bles_docs._id",
                    "status": { $first: "$status" },
                    "room_name": { $push: "$segments_docs.name" },
                    "ble_address": { $first: "$bles_docs.address" },
                    "floor_name": { $first: "$floors_docs.alias" },
                    "building_name": { $first: "$building_docs.alias" },
                    "lastUpdated": { $first: "$lastUpdated" },
                    "timezone": { $first: "$building_docs.timezone" },
                    "timezoneoffset": { $first: "$building_docs.timezoneOffset" },
                    "hostName": { $first: "$host_docs.name" }
                }
            };
            let Project = {
                $project: {
                    "ble_address": "$bles_docs.address",
                    "floor_name": "$floors_docs.alias",
                    "room_name": ["$sections_docs.name"],
                    "building_name": "$building_docs.alias",
                    "zonedTime": { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$lastUpdated", timezone: "$building_docs.timezone" } },
                    lastUpdated: 1,
                    status: 1,
                    "_id": "$bles_docs._id",
                    "timezone": "$building_docs.timezone",
                    "timezoneoffset": "$building_docs.timezoneOffset",
                    "hostName": "$host_docs.name"
                }
            };

            let builg = [],
                buildingM;
            if (Buildings.length > 0) {
                Buildings.map((b) => {
                    if (b.subdomain === obj.subdomain)
                        builg.push(mongoose.Types.ObjectId(b.id))
                })
                buildingM = { $in: builg };
            } else {
                buildingM = { $nin: builg };
            };

            let MatchNotPIR = { $match: { "building_docs.alias": { $nin: bu } } };
            let userBlgMatch = { $match: { "building_docs._id": buildingM } };

            try {
                let result = [];
                let segments = await db[obj.subdomain].segmentToBles.aggregate([blesLook, blesUnwind, floorLook, floorUnwind, buildLook,
                    buildUnwind, userBlgMatch, hostLook, hostUnwind, segmentLook, segmentUnwind, Group
                ]);
                let rooms = await db[obj.subdomain].roomToBles.aggregate([blesLook, blesUnwind, floorLook, floorUnwind, sectionLook, sectionsUnwind, buildLook,
                    buildUnwind, userBlgMatch, hostLook, hostUnwind, MatchNotPIR, Project
                ]);

                if (segments.length > 0) {
                    for (let i of segments) {
                        result.push(i)
                    }
                }
                if (rooms.length > 0) {
                    for (let i of rooms) {
                        result.push(i)
                    }
                }

                if (result.length > 0) {
                    result.forEach(async function(room, i) {
                        timezone = room.timezone;

                        var startm = moment.tz(timezone).startOf('day').format();
                        var endm = moment.tz(timezone).endOf('day').format();
                        var momentstart = moment.tz(dates.FromDate, timezone).startOf('day').format();
                        var momentend = moment.tz(dates.ToDate, timezone).subtract(1, 'day').endOf('day').format();
                        var sendStruc = {};
                        let startdate = await getStartDate(req.body, room._id);
                        sendStruc.id = i,
                            sendStruc.customers = req.body.subdomain,
                            sendStruc.buildings = room.building_name,
                            sendStruc.blgtimezone = room.timezone,
                            sendStruc.blgoffset = room.timezoneoffset,
                            sendStruc.floors = room.floor_name,
                            sendStruc.bleaddress = room.ble_address,
                            sendStruc.status = room.status,
                            sendStruc.lastresponsetime = room.zonedTime,
                            sendStruc.noofresponsesTillNow = await gethealthLog(req.body.subdomain, momentstart, momentend, room._id),
                            sendStruc.startDate = moment.tz(startdate, room.timezone).format("DD/M/YYYY hh:mm A"),
                            sendStruc.bleId = room._id;

                        sendStruc.hostName = room.hostName;
                        sendStruc.noofresponses = await gethealthLog(req.body.subdomain, startm, endm, room._id);
                        sendStruc.areaName = room.room_name;
                        sendArray.push(sendStruc);
                        let df = new Date(momentstart),
                            dt = new Date(momentend);
                        await multi.rpush(`getPcsDatas-${req.body.subdomain}-${df.getDate()  }-${dt.getDate()}`, JSON.stringify(sendStruc));
                        if (result.length == ++count) {
                            console.log(" PCS response from = ", req.body.subdomain);
                            multi.exec(async(err, res) => {
                                err ? console.error(err, "error") : await client.expire(`getPcsDatas-${req.body.subdomain}-${df.getDate()  }-${dt.getDate()}`, 600);
                            });
                            res.send(sendArray.sort(function(a, b) { return a.id - b.id }))
                        }
                    })
                } else {
                    console.log(" PCS no response from = ", req.body.subdomain);
                    res.send(sendArray);
                }
            } catch (e) {
                console.log(e.message)
            }

        } else {
            res.status(400).send({ error: "no authToken matched " })
        }
    } catch (e) {
        console.log(e.message);
        res.send({ err: e.message })
    }



}

exports.getPcsCountCache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getPcsCount-${obj.subdomain}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err, "not cached so Orginal Request PCS", obj.subdomain)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}


exports.getPcsCount = async(req, res, next) => {
    try {
        let multi = client.multi();
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
        });
        const resultT = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
        let pass = resultT.password === objC.password;
        if (pass == true) {
            let Buildings = resultT.Buildings;
            let obj = req.body;
            let builg = [],
                buildingM;
            if (Buildings.length > 0) {
                Buildings.map((b) => {
                    if (b.subdomain === obj.subdomain)
                        builg.push(mongoose.Types.ObjectId(b.id))
                })
                buildingM = { $in: builg };
            } else {
                buildingM = { $nin: builg };
            }

            var bu = ['SGP-MBFC', 'Barclays Japan'];

            let key = req.body.key;
            let floorObj = { $lookup: { from: "floors", localField: "floorId", foreignField: "_id", as: "floors_docs" } };
            let unwindFloor = { $unwind: "$floors_docs" };
            let blesObj = { $lookup: { from: "bles", localField: "bleId", foreignField: "_id", as: "bles_docs" } };
            let unwindBles = { $unwind: "$bles_docs" };
            let buildingObj = { $lookup: { from: "buildings", localField: "floors_docs.buildingId", foreignField: "_id", as: "building_docs" } };
            let userBlgMatch = { $match: { "building_docs._id": buildingM } };
            let unwindBuilding = { $unwind: "$building_docs" };
            let MatchNotPIR = { $match: { "building_docs.alias": { $nin: bu } } };
            let RGroup = { $group: { _id: { buildingId: "$building_docs._id" }, total: { $sum: 1 } } };
            let SGroup1 = { $group: { _id: { bles: "$bleId" }, building: { $first: "$building_docs._id" } } };
            let SGroup2 = { $group: { _id: { buildingId: "$building" }, total: { $sum: 1 } } }
            let project = { $project: { building: "$_id.buildingId", _id: 0, total: 1 } };
            let segments = [],
                rooms = [],
                result = [];
            let dataObj = { building: "", working: 0, installed: 0 };
            if (key == true) {
                let Match = { $match: { "building_docs._id": mongoose.Types.ObjectId(obj.buildingId), status: true } };
                segments = await db[obj.subdomain].segmentToBles.aggregate([
                    floorObj, unwindFloor, blesObj, unwindBles, buildingObj, unwindBuilding, Match, Group, project
                ]);
                rooms = await db[obj.subdomain].roomToBles.aggregate([
                    floorObj, unwindFloor, blesObj, unwindBles, buildingObj, unwindBuilding, Match, Group, project
                ]);
            }
            if (key == false) {
                segments = await db[obj.subdomain].segmentToBles.aggregate([floorObj, unwindFloor, blesObj, unwindBles,
                    buildingObj, unwindBuilding, userBlgMatch, SGroup1, SGroup2, project
                ]);
                if (segments.length > 0) {
                    for (let sen of segments) {
                        dataObj.building = sen.building;
                        dataObj.installed = sen.total;
                        let Match = { $match: { "building_docs._id": mongoose.Types.ObjectId(sen.building), status: true } };
                        let segblesTotal = await db[obj.subdomain].segmentToBles.aggregate([floorObj, unwindFloor, blesObj, unwindBles, buildingObj,
                            unwindBuilding, Match, SGroup1, SGroup2, project
                        ]);
                        for (let segW of segblesTotal) {
                            dataObj.working = segW.total;
                        }
                    }
                }
                rooms = await db[obj.subdomain].roomToBles.aggregate([floorObj, unwindFloor, blesObj,
                    unwindBles, buildingObj, unwindBuilding, userBlgMatch, MatchNotPIR, RGroup, project
                ]);
                if (rooms.length > 0) {
                    for (let room of rooms) {
                        dataObj.building = room.building;
                        dataObj.installed += room.total;
                        let Match = { $match: { "building_docs._id": mongoose.Types.ObjectId(room.building), status: true } };
                        let roomblesTotal = await db[obj.subdomain].roomToBles.aggregate([floorObj, unwindFloor, blesObj, unwindBles, buildingObj, unwindBuilding, Match, RGroup, project]);
                        for (let roomW of roomblesTotal) {
                            dataObj.working += roomW.total;
                        }
                    }
                    multi.rpush(`getPcsCount-${obj.subdomain}`, JSON.stringify(dataObj));
                    result.push(dataObj)
                } else {
                    multi.rpush(`getPcsCount-${obj.subdomain}`, JSON.stringify(dataObj));
                    result.push(dataObj)
                }
            }
            await multi.exec(async(err, res) => {
                err ? console.error(err, "error") : await client.expire(`getPcsCount-${obj.subdomain}`, 600);
            });
            console.log(" PCS no response from = ", obj.subdomain);
            res.send(result);

        } else {
            res.status(400).send({ error: "no authToken matched " })
        }
    } catch (e) {

        console.log(e.message);
        res.send([]);
    }
}






async function gethealthLog(subdomain, startm, endm, bleId) {
    var d = await db[subdomain].sensorHealthLogs.countDocuments({
        time: {
            $gte: new Date(startm),
            $lte: new Date(endm)
        },
        sensorId: bleId
    })
    return d;
}


exports.getLiveData = async function(req, res, next) {
    try {
        var obj = req.body;
        var startDate = await db[obj.subdomain].sensorHealthLogs.find({}, { time: 1, _id: 0 }).sort({ time: 1 }).limit(1);
        console.log(" PCS response from getLiveData = ", obj.subdomain);
        res.send(startDate);
    } catch (e) {

        console.log(e)
    }
}


exports.gethealthcountcache = async(req, res, next) => {
    try {
        let obj = req.body;
        let timeType = obj.favoriteType;
        let type = obj.selecttype;
        var endDate = await db[obj.subdomain].sensorHealthLogs.find({}, { time: 1, _id: 0 }).sort({ time: -1 }).limit(1);
        var mEnd = moment.tz(endDate[0].time, obj.timezone).utc(),
            mStart;
        if (timeType == 'LastWeek') {
            mStart = moment(moment(mEnd.valueOf()).subtract(1, 'week'));
        }
        if (timeType == 'LastMonth') {
            mStart = moment(moment(mEnd.valueOf()).subtract(1, 'month'));
        }
        if (timeType == 'FromBeginning') {
            mStart = moment.tz(obj.selectedDate.begin, obj.timezone).utc();
            mEnd = moment.tz(obj.selectedDate.end, obj.timezone).utc();
        }
        client.lrange(`gethealthcount-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                console.log("Im in Cache")
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.gethealthcount = async function(req, res, next) {
    try {
        let multi = client.multi();
        console.log(" gethealthcount is processing");
        var obj = req.body;
        var type = obj.selecttype;
        let timeType = obj.favoriteType;
        var endDate = await db[obj.subdomain].sensorHealthLogs.find({}, { time: 1, _id: 0 }).sort({ time: -1 }).limit(1);
        let mStart;
        var mEnd = moment.tz(endDate[0].time, obj.timezone).utc();
        // let startDate = await db[obj.subdomain].sensorHealthLogs.find({}, { time: 1, _id: 0 }).sort({ time: 1 }).limit(1);
        res.setTimeout(500000);
        if (timeType == 'LastWeek') {
            mStart = moment(moment(mEnd.valueOf()).subtract(1, 'week'));
        }
        if (timeType == 'LastMonth') {
            mStart = moment(moment(mEnd.valueOf()).subtract(1, 'month'));
        }
        if (timeType == 'FromBeginning') {
            mStart = moment.tz(obj.selectedDate.begin, obj.timezone).utc();
            mEnd = moment.tz(obj.selectedDate.end, obj.timezone).utc();
        }
        var dates = [],
            qcounter = 0;
        var floors = await db[obj.subdomain].buildings.find({ alias: obj.building }, { floors: 1, _id: 0 })
        let Blescount = [];
        const range = moment.range(mStart, mEnd);
        let diff = mEnd.diff(mStart, 'days');
        if (type == "NOVA") {
            // limit = 1440;
            let segmentscount = await db[obj.subdomain].segmentToBles.find({ floorId: { $in: floors[0].floors } }, { bleId: 1, _id: 0 });
            let roomscount = await db[obj.subdomain].roomToBles.find({ floorId: { $in: floors[0].floors } }, { bleId: 1, _id: 0 });
            for (let ble of segmentscount) {
                Blescount.push(ble)
            }
            for (let ble of roomscount) {
                Blescount.push(ble)
            }
        }
        if (type == "DESK") {
            // limit = 144;
            Blescount = await db[obj.subdomain].sensorToBles.find({ floorId: { $in: floors[0].floors } });

        }
        if (Blescount.length > 0) {
            Blescount = Blescount.map((room) => room.bleId);
            for (let dat of range.by('day')) {
                dayStart = moment(dat.valueOf()).startOf('day').tz(obj.timezone, true);
                dayEnd = moment(dat.valueOf()).endOf('day').tz(obj.timezone, true);
                let match = {
                    $match: {
                        time: {
                            $gte: new Date(dayStart.valueOf()),
                            $lte: new Date(dayEnd.valueOf())
                        },
                        sensorId: { $in: Blescount }
                    }
                };
                let datalogs = await db[obj.subdomain].sensorHealthLogs.aggregate([
                    match,
                    {
                        $project: {
                            _id: "$sensorId",
                            day: { $dateToString: { format: '%d-%m-%Y', date: { $add: ['$time', obj.timezoneOffset] } } },
                            hours: { $hour: { $add: ['$time', obj.timezoneOffset] } },
                            minute: {
                                $subtract: [{ $minute: { $add: ['$time', obj.timezoneOffset] } },
                                    { $mod: [{ $minute: { $add: ['$time', obj.timezoneOffset] } }, 10] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { id: "$_id", day: "$day", hours: "$hours", min: "$minute" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: { id: "$_id.id", day: "$_id.day", hours: "$_id.hours" },
                            sumhours: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: { id: "$_id.id", day: "$_id.day" },
                            sumday: { $sum: "$sumhours" }
                        }
                    },
                    { $project: { sensorId: "$_id.id", day: "$_id.day", count: "$sumday", _id: 0 } }
                ]);
                let newArray = [];
                for (ble of Blescount) {
                    let temp = _.find(datalogs, { 'sensorId': ble });
                    if (temp) {
                        newArray.push(temp)
                    } else {
                        newArray.push({ sensorId: ble, count: 0 })
                    }
                }
                let datatoPush = { day: new Date(), notworking: 0, working: 0, total: 0 };
                datatoPush.day = new Date(dat);


                datatoPush.total = newArray.length;
                if (newArray.length > 0) {
                    for await (let row of newArray) {
                        if (row.count >= 115) {
                            ++datatoPush.working;
                        }
                        if (row.count < 115) {
                            ++datatoPush.notworking;
                        }
                    }
                    dates.push(datatoPush);
                    await multi.rpush(`gethealthcount-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, JSON.stringify(datatoPush));
                    if (++qcounter == diff) {
                        multi.exec((err, res) => {
                            err ? console.error(err, "error") : client.expire(`gethealthcount-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, 600);
                        });
                        console.log(` unhealth trend data of ${diff} days responded`);
                        res.send(dates);
                    }
                } else {
                    dates.push(datatoPush)
                    await multi.rpush(`gethealthcount-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, JSON.stringify(datatoPush));
                    if (++qcounter == diff) {
                        multi.exec((err, res) => {
                            err ? console.error(err, "error") : client.expire(`gethealthcount-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, 600);
                        });
                        console.log(` unhealth trend data of ${diff} days responded`)
                        res.send(dates);
                    }
                }
            }
        }

    } catch (e) {
        console.log(e.message)
    }
}




exports.getMinutesData = async function(req, res, next) {
    var obj = req.body;
    var finaldata = {};
    var type = obj.selecttype;
    var d = [],
        health = [];
    res.setTimeout(500000);
    let startm = moment.utc(obj.FromDate).format(),
        endm = moment.utc(obj.ToDate).format();
    // let startm = moment.tz(obj.FromDate, obj.blgtimezone).format(),
    //     endm = moment.tz(obj.ToDate, obj.blgtimezone).format();
    // console.log(startm, endm, "dazte")
    if (type == "NOVA") {
        d = await db[obj.subdomain].sensorDatas.aggregate([
            { $match: { sensorId: mongoose.Types.ObjectId(obj.bleId), time: { $gte: new Date(startm.valueOf()), $lte: new Date(endm.valueOf()) } } },
            { $group: { _id: "$time", density: { $avg: "$density" }, time: { $first: "$time" }, sensorId: { $first: "$sensorId" } } },
            { $project: { sensorId: "$sensorId", time: "$time", density: "$density", _id: "$_id" } }
        ]);
    }
    if (type == "DESK") {
        d = await db[obj.subdomain].sensorDatas.aggregate([
            { $match: { sensorId: mongoose.Types.ObjectId(obj.bleId), time: { $gte: new Date(startm.valueOf()), $lte: new Date(endm.valueOf()) } } },
            { $group: { _id: "$time", occupancy: { $avg: "$occupancy" }, time: { $first: "$time" }, sensorId: { $first: "$sensorId" } } },
            { $project: { sensorId: "$sensorId", time: "$time", density: "$occupancy", _id: "$_id" } }
        ]);
    }


    if (type == "HOST") {
        health = await db[obj.subdomain].hostLogs.aggregate([
            { $match: { hostId: mongoose.Types.ObjectId(obj.bleId), lastUpdated: { $gte: new Date(startm.valueOf()), $lte: new Date(endm.valueOf()) } } },
            { $group: { _id: { time: "$lastUpdated", sensorId: "$hostId" }, count: { $sum: 1 } } },
        ]);

    } else {
        health = await db[obj.subdomain].sensorHealthLogs.aggregate([
            { $match: { sensorId: mongoose.Types.ObjectId(obj.bleId), time: { $gte: new Date(startm.valueOf()), $lte: new Date(endm.valueOf()) } } },
            { $group: { _id: { time: "$time", sensorId: "$sensorId" }, count: { $sum: 1 } } },
        ]);
    }

    health.sort(function(a, b) { return a._id.time - b._id.time });
    d.sort(function(a, b) { return a.time - b.time });
    // console.log(d, "data")
    finaldata.health = healthData(health, startm, obj.blgtimezone, endm);
    finaldata.minute = minuteData(d, startm, obj.blgtimezone, endm);
    finaldata.hours = HourData(d, startm, obj.blgtimezone, endm);
    finaldata.timezone = obj.blgtimezone;
    finaldata.subdomain = obj.subdomain;
    finaldata.roomName = obj.roomName;
    finaldata.bleAddress = obj.bleAddress;
    finaldata.floors = obj.floors;
    finaldata.fromDate = obj.FromDate;
    finaldata.buildings = obj.buildings;
    console.log(" Minutes response from getMinutesData = ", obj.subdomain);
    res.status(200).json(finaldata)
}

function healthData(health, s, timezone, e) {
    var result = [];
    const range = moment.range(s, e);
    try {
        for (let dat of range.by('day')) {
            var s = new Date(moment.tz(dat, timezone).valueOf())
            if (health.length) {
                for (var i = 0; i < 24; i++) {
                    for (var j = 0; j < 60; j++) {
                        var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':00', timezone),
                            eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':59', timezone),
                            st = new Date(sTime),
                            et = new Date(eTime);
                        var resd = _.find(health, function(obj) {
                            if (obj._id.time.getTime() >= st.getTime() && (obj._id.time.getTime() <= et.getTime())) {
                                return obj
                            }
                        })
                        if (resd != undefined) {
                            let obj = { time: moment(sTime).utc().format(), count: 0 };
                            obj.count = resd.count;
                            result.push(obj)
                        } else {
                            let obj = { time: moment(sTime).utc().format(), count: 0 };
                            result.push(obj)
                        }
                    }
                }
            } else {
                for (var i = 0; i < 24; i++) {
                    for (var j = 0; j < 60; j++) {
                        var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':00', timezone),
                            eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':59', timezone);
                        let obj = { time: moment(sTime).utc().format(), count: 0 };
                        result.push(obj)
                    }
                }
            }
        }
        return result
    } catch (e) {
        console.log(e.message);
        return result;
    }

}

function minuteData(d, s, timezone, e) {
    var result = [];

    // var mStart = moment.tz(s, timezone).utc();
    // var mEnd = moment.tz(e, timezone).utc();
    const range = moment.range(s, e);

    try {
        for (let dat of range.by('day')) {
            var s = new Date(moment.tz(dat, timezone).valueOf())
            for (var i = 0; i < 24; i++) {
                for (j = 0; j < 60; j++) {
                    var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':00', timezone),
                        eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':59', timezone),
                        st = new Date(sTime),
                        et = new Date(eTime)
                    var resd = _.find(d, function(obj) {
                        if ((obj.time.getTime() >= st.getTime()) && (obj.time.getTime() <= et.getTime())) {
                            return obj
                        }

                    });
                    if (resd !== undefined) {
                        let obj = { time: moment(sTime).utc().format(), count: 0 };
                        obj.count = resd.density;

                        result.push(obj)
                    } else {
                        let obj = { time: moment(sTime).utc().format(), count: 0 };
                        result.push(obj);
                    }
                }
            }
        }
        console.log(result, "result");
        return result
    } catch (e) {
        console.log(e.message)
    }

}

function HourData(d, s, timezone, e) {
    var result = []
        // result.labels = []
        // result.values = []
    var mStart = moment.tz(s, timezone).utc();
    var mEnd = moment.tz(e, timezone).utc();
    const range = moment.range(mStart, mEnd);
    try {
        for (let dat of range.by('day')) {
            var s = new Date(dat)
            for (var i = 0; i < 24; i++) {
                var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':00:00', timezone),
                    eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':59:59', timezone),
                    st = new Date(sTime),
                    et = new Date(eTime)
                var resd = _.find(d, function(obj) {
                    if ((obj.time.getTime() >= st.getTime()) && (obj.time.getTime() <= et.getTime())) {
                        return obj
                    }

                })
                if (resd != undefined) {
                    let obj = { time: sTime.valueOf(), count: 0 };
                    obj.count = Math.round(resd.density);
                    result.push(obj);
                } else {
                    let obj = { time: sTime.valueOf(), count: 0 };
                    result.push(obj);
                }
            }
        }
        return result;
    } catch (e) {
        console.log(e.message)
    }
}

async function getStartDate(obj, bleId) {
    try {
        var d = await db[obj.subdomain].sensorHealthLogs.find({ sensorId: bleId }, { time: 1, _id: 0 }).sort({ time: 1 }).limit(1);
        if (d.length > 0) {
            return d[0].time;
        } else {
            return moment().unix()
        }

    } catch (e) {
        console.log(e.message)
    }
}

exports.sendBleLogs = function(req, res, next) {
    try {
        // console.log("here")
        var obj = req.body;
        // console.log(obj,"obj")
        db['localhost'].pcsbleissues.findOneAndUpdate({ bleId: mongoose.Types.ObjectId(obj.bleId), resolved: false },
            obj, { upsert: true, new: true },
            function(err, blelogs) {
                if (err)
                    console.log(err)

                console.log(" PCS response from sendBleLogs = ", obj.subdomain);
                res.send(blelogs)
            })
    } catch (e) {
        console.log(e.message)
    }
}


exports.resolveBleLogs = function(req, res, next) {
    try {
        var obj = req.body;
        db['localhost'].pcsbleissues.findOneAndUpdate({ bleId: mongoose.Types.ObjectId(obj.bleId), resolved: false },
            obj, { upsert: true, new: true },
            function(err, blelogs) {
                if (err)
                    console.log(err)
                console.log(" localhost response from resolveBleLogs ");
                res.send(blelogs)
            })
    } catch (e) {
        console.log(e.message)
    }
}

exports.getBleLogscache = async(req, res, next) => {
    try {
        let obj = req.body;
        await client.lrange(`getBleLogs-localhost`, 0, -1, (err, data) => {
            if (data.length > 0) {
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err, "getBleLogs-localhost", data)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getBleLogs = function(req, res, next) {
    try {
        let multi = client.multi();
        db['localhost'].pcsbleissues.find({ resolved: false }, { bleId: 1, areaName: 1, subject: 1, comments: 1 }, async function(err, pcslogs) {
            if (err)
                res.status(400).send({ err: e.message })
            else {
                await multi.rpush(`getBleLogs-localhost`, JSON.stringify(pcslogs));
                multi.exec(async(err, res) => {
                    err ? console.error(err, "error") : await client.expire(`getBleLogs-localhost`, 600);
                });
                console.log(" localhost response from getBleLogs");
                res.send(pcslogs);
            }
        })
    } catch (e) {
        console.error(e);
        res.status(400).send({ err: e.message })
    }

}


exports.getBleSubject = function(req, res, next) {
    db['localhost'].pcsbleissues.distinct("subject", function(err, pcslogs) {
        if (err)
            res.send(err)
        else {
            console.log(" localhost response from getBleSubject");
            res.send(pcslogs);
        }
    })
}

exports.getBleLogsByRmName = function(req, res, next) {
    var obj = req.body;
    db['localhost'].pcsbleissues.find({ areaName: obj.areaName, resolved: false }, { bleId: 1, areaName: 1, subject: 1, comments: 1 }, function(err, pcslogs) {
        if (err)
            res.send(err)
        else {
            console.log(" localhost response from getBleLogsByRmName");
            res.send(pcslogs);
        }
    })
}


exports.getBleLogsForMails = function(req, res, next) {
    var obj = req.body;
    db['localhost'].pcsbleissues.aggregate([
        { $match: { bleaddress: obj.bleAddress } },
        {
            $group: {
                "_id": { subject: "$subject", customer: "$customers", building: "$buildings", floor: "$floors" },
                "roomData": { "$push": { bleaddress: "$bleaddress", notes: "$comments", areaName: "$areaName" } },
            }
        },
        {
            $group: {
                "_id": { subject: "$_id.subject" },
                Faults: {
                    $push: {
                        customer: "$_id.customer",
                        building: "$_id.building",
                        floor: "$_id.floor",
                        roomData: "$roomData"
                    }
                }
            }
        },
        { $project: { "subject": "$_id.subject", faults: "$Faults", _id: 0 } }
    ], function(err, result) {
        if (err)
            console.log(err)
        else {
            console.log(" localhost response from getBleLogsForMails");
            res.send(result)
        }

    })
}

isArray = function(a) {
    return (!!a) && (a.constructor === Array);
};

isObject = function(a) {
    return (!!a) && (a.constructor === Object);
};


exports.sendMails = async function(result, res) {
    let obj;
    // if (isArray(result)) {
    //     obj = result;
    // }
    // if (isObject(result)) {
    obj = result.body;
    // }
    // var obj = req.body;

    // obj = result;
    console.log(obj, "obj");
    // res.send("send")
    var nodemailer = require('nodemailer');
    var SMTPTransport = require("nodemailer-smtp-transport")
    var smtpTransport = nodemailer.createTransport(SMTPTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
        auth: {
            user: 'admin@adappt.com',
            pass: 'adappt@2017'
        }
    }));
    var mailOptions = {
        from: "Adappt info <admin@adappt.com>",
        to: 'support@adappt.com',
        subject: ` SENSORS ISSUES`,
        html: ``
    };
    mailOptions.html = '<html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title></title><link rel="stylesheet" href=""></head><body><header id="header" class=""></header><content><div style="background:#f9f9f9;color:#373737;font-family:Helvetica,Arial,sans-serif;font-size:17px;line-height:24px;max-width:100%;width:100%!important;margin:0 auto;padding:0"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;margin:0;padding:0;width:100%;font-size:17px;color:#373737;background:#f9f9f9"><tbody><tr><td valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tbody><tr><td valign="bottom" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;padding:20px 16px 12px"><div style="text-align:center"><a href="#" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word" target="_blank" data-saferedirecturl="#"><img src="http://barclays.adapptonline.com/img/adappt.png" width="150" height="56" style="outline:none;text-decoration:none;border:none" class="CToWUd"></a></div></td></tr></tbody></table></td></tr><tr><td valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table cellpadding="32" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background:white;border-radius:0.5rem;margin-bottom:1rem"><tbody><tr><td width="650" valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><div style="max-width:650px;margin:0 auto"><h2 style="color:#3a3b3c;line-height:30px;margin-bottom:12px;margin:0 auto 2rem;font-size:1.8rem;text-align:center">PCS Status Update:</h2><h3 style="color:#3a3b3c;line-height:26px;margin-bottom:2rem;font-size:1.2rem;text-align:center;margin:0 auto 1rem">The PCS mentioned below need to be checked</h3><ul style="display: inline-block;">';


    if (obj.length > 0) {
        obj.forEach(o => {
            mailOptions.html += '<li><b>' + o.subject + '</b></li>';
            o.faults.forEach(f => {
                mailOptions.html += '<ul style="display: inline-block;"><li> customer: <b>' + f.customer + '</b></li><li> building: <b>' + f.building + '</b></li><li> Floor: <b>' + f.floor + '</b></li> ';
                f.roomData.forEach(r => {
                    mailOptions.html += '<ul style="display: inline-block;"><li> areaName: <b>' + r.areaName + '</b></li><li> bleaddress: <b>' + r.bleaddress + '</b></li><li> notes: <b>' + r.notes + '</b></li></ul>';
                })
            })
            mailOptions.html += '</ul>'
        })
    }

    mailOptions.html += '</div></td></tr></tbody></table></td></tr><tr><td style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin-top:1rem;background:white;color:#989ea6"><tbody><tr><td style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;height:5px;background-image:url("#");background-repeat:repeat-x;background-size:auto 5px"></td></tr><tr><td valign="top" align="center" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;padding:16px 8px 24px"><div style="max-width:600px;margin:0 auto"><p style="font-size:12px;line-height:20px;margin:0 0 16px;margin-top:16px">Made by <a href="www.adappt.com" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word" target="_blank" data-saferedirecturl="www.adappt.com">Adappt Intelligence</a><br/><a href="www.adappt.com" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word;text-align: center;" target="_blank" data-saferedirecturl="www.adappt.com" >All Rights Reserved by &copy; Adappt </a></p></div></td></tr></tbody></table></td></tr></tbody></table></div></content></body></html>';


    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            // console.log("Mail error");
            console.log(error);
        } else {
            // if (isArray(result)) {
            //     // obj = result;
            // console.log({ mailId: response.accepted[0] });
            console.log(" localhost response from sendMails");
            // return { mailId: response.accepted[0] };
            // }
            // if (isObject(result)) {
            res.send({ mailId: response.accepted[0] });
            // }
        }
    });
}


exports.scheduleMails = async(req, res, next) => {
    db['localhost'].pcsbleissues.aggregate([
        { $match: { resolved: false } },
        {
            $group: {
                "_id": { subject: "$subject", customer: "$customers", building: "$buildings", floor: "$floors" },
                "roomData": { "$push": { bleaddress: "$bleaddress", notes: "$comments", areaName: "$areaName" } },
            }
        },
        {
            $group: {
                "_id": { subject: "$_id.subject" },
                Faults: {
                    $push: {
                        customer: "$_id.customer",
                        building: "$_id.building",
                        floor: "$_id.floor",
                        roomData: "$roomData"
                    }
                }
            }
        },
        { $project: { "subject": "$_id.subject", faults: "$Faults", _id: 0 } }
    ], async function(err, result) {
        if (err)
            console.log(err)
        else {
            // console.log("sending schedule mail");
            // console.log(result)
            let data = await exports.sendMails(result, res);
            res.json({ data: "Mail Sent" });
        }
    })
}