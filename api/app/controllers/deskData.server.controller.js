var db = require('../../config/mongoose'),
    jwt = require('jsonwebtoken');
var moment = require('moment-timezone');
var _ = require('lodash');
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
exports.getDeskDatasCache = async(req, res, next) => {
    try {
        let dates = req.body;
        let df = new Date(dates.FromDate),
            dt = new Date(dates.ToDate);
        client.lrange(`getDeskDatas-${req.body.subdomain}-${df.getDate()  }-${dt.getDate()}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                console.log("Im in Cache");
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err, "not cached so Orginal Request getDeskDatas", dates.subdomain)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getDeskDatas = async function(req, res, next) {
    let multi = client.multi();
    let objC;

    jwt.verify(req.authToken, req.config.tokenSecret, async(err, decoded) => {
        if (err) {
            res.status(403).send({ err });
        } else {

            try {
                objC = Object.assign({}, decoded);
                const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
                let pass = result.password === objC.password;
                if (pass == true) {
                    let Buildings = result.Buildings;
                    var dates = req.body;
                    // console.log(dates, "dates")
                    let builg = [],
                        buildingM;
                    if (Buildings.length > 0) {
                        Buildings.map((b) => {
                            if (b.subdomain === dates.subdomain)
                                builg.push(mongoose.Types.ObjectId(b.id))
                        })
                        buildingM = { $in: builg };
                    } else {
                        buildingM = { $nin: builg };
                    };

                    res.setTimeout(500000);

                    db[req.body.subdomain].sensorToBles.aggregate([
                        { $lookup: { from: "bles", localField: "bleId", foreignField: "_id", as: "bles_docs" } }, { $unwind: { path: "$bles_docs", preserveNullAndEmptyArrays: true } },
                        { $lookup: { from: "floors", localField: "floorId", foreignField: "_id", as: "floors_docs" } }, { $unwind: "$floors_docs" },
                        { $lookup: { from: "seats", localField: "seatId", foreignField: "_id", as: "seats_docs" } }, { $unwind: { path: "$seats_docs", preserveNullAndEmptyArrays: true } },
                        { $lookup: { from: "buildings", localField: "floors_docs.buildingId", foreignField: "_id", as: "building_docs" } },
                        { $unwind: "$building_docs" },
                        { $match: { "building_docs._id": buildingM } },
                        { $lookup: { from: "hosts", localField: "bles_docs.hostId", foreignField: "_id", as: "host_docs" } }, { $unwind: { path: "$host_docs", preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                status: 1,
                                "ble_address": "$bles_docs.address",
                                "floor_name": "$floors_docs.alias",
                                "seat_name": "$seats_docs.name",
                                "building_name": "$building_docs.alias",
                                "zonedTime": { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$lastStatusUpdate", timezone: "$building_docs.timezone" } },
                                "bleId": "$bles_docs._id",
                                "timezone": "$building_docs.timezone",
                                "timezoneoffset": "$building_docs.timezoneOffset",
                                "hostName": "$host_docs.name"
                            }
                        }
                    ]).exec(async function(err, deskUnCount) {
                        var sendArray = [],
                            count = 0,
                            counter = 0;

                        if (deskUnCount.length > 0) {
                            deskUnCount.forEach(async desk => {
                                timezone = desk.timezone;
                                // console.log(dates, "dates")
                                var startm = moment.tz(timezone).startOf('day').format();
                                var endm = moment.tz(timezone).endOf('day').format();
                                var momentstart = moment.tz(dates.FromDate, desk.timezone).startOf('day').format();
                                var momentend = moment.tz(dates.ToDate, desk.timezone).subtract(1, 'day').endOf('day').format();
                                console.log(startm, endm, momentstart, momentend, "time", dates)
                                var sendStruc = {};
                                let healthLog = await gethealthLog(req.body.subdomain, startm, endm, desk.bleId)
                                let startdate = await getStartDate(req.body, desk.bleId);
                                sendStruc.customers = req.body.subdomain,
                                    sendStruc.buildings = desk.building_name,
                                    sendStruc.blgtimezone = desk.timezone,
                                    sendStruc.blgoffset = desk.timezoneoffset,
                                    sendStruc.floors = desk.floor_name,
                                    sendStruc.bleaddress = desk.ble_address,
                                    sendStruc.status = desk.status,
                                    sendStruc.lastresponsetime = desk.zonedTime,
                                    sendStruc.noofresponsesTillNow = await gethealthLog(req.body.subdomain, momentstart, momentend, desk.bleId),
                                    sendStruc.startDate = moment.tz(startdate, desk.timezone).format("DD-M-YYYY hh:mm A"),
                                    sendStruc.bleId = desk.bleId;
                                sendStruc.hostName = desk.hostName;
                                sendStruc.areaName = desk.seat_name;
                                sendStruc.noofresponses = healthLog
                                sendArray.push(sendStruc);
                                let df = new Date(momentstart),
                                    dt = new Date(momentend);
                                await multi.rpush(`getDeskDatas-${req.body.subdomain}-${df.getDate()  }-${dt.getDate()}`, JSON.stringify(sendStruc));
                                if (++counter == deskUnCount.length) {
                                    console.log("response from =", req.body.subdomain);
                                    multi.exec(async(err, res) => {
                                        err ? console.error(err, "error") : await client.expire(`getDeskDatas-${req.body.subdomain}-${df.getDate()  }-${dt.getDate()}`, 600);
                                    });
                                    res.send(sendArray.sort(function(a, b) { return a.id - b.id }))
                                }
                            });

                        } else {
                            console.log(" No response from =", req.body.subdomain)
                            res.send(sendArray);
                        }
                    })

                } else {
                    res.status(400).send({ error: "no authToken matched " })
                }
            } catch (e) {
                console.log(e.message)
            }
        }
    });



}

exports.getDeskCountCache = async(req, res, next) => {
    try {
        let obj = req.body;
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            } else {
                objC = Object.assign({}, decoded);
                client.lrange(`getDeskCount-${obj.subdomain}-${objC.username}-${req.body.key}`, 0, -1, (err, data) => {
                    if (data.length > 0) {
                        let finalArray = [];
                        for (let t of data) {
                            finalArray.push(JSON.parse(t))
                        }
                        res.send(finalArray);
                    } else {
                        console.log(err, "not cached so Orginal Request DESK", obj.subdomain)
                        next();
                    }
                })
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}




exports.getDeskCount = async function(req, res, next) {
    let multi = client.multi();
    let objC;
    jwt.verify(req.authToken, req.config.tokenSecret, async(err, decoded) => {
        if (err) {
            res.status(403).send({ err });
        } else {
            objC = Object.assign({}, decoded);
            const resultT = await db['localhost'].users.findOne({ username: objC.username, password: objC.password }, { password: 1, _id: 0, Buildings: 1 });
            let pass = resultT.password === objC.password;
            if (pass == true) {
                let Buildings = resultT.Buildings;
                var dates = req.body;
                res.setTimeout(500000);
                var obj = req.body;
                let key = req.body.key;
                let result = [];
                var obj = req.body;
                let timezone;
                let startm;
                let endm;

                try {
                    if (key == true) {
                        result = await db[obj.subdomain].sensorToBles.aggregate([
                            { $lookup: { from: "bles", localField: "bleId", foreignField: "_id", as: "bles_docs" } }, { $unwind: "$bles_docs" },
                            { $lookup: { from: "floors", localField: "floorId", foreignField: "_id", as: "floors_docs" } }, { $unwind: "$floors_docs" },
                            { $lookup: { from: "seats", localField: "seatId", foreignField: "_id", as: "seats_docs" } }, { $unwind: "$seats_docs" },
                            { $lookup: { from: "buildings", localField: "floors_docs.buildingId", foreignField: "_id", as: "building_docs" } }, { $unwind: "$building_docs" },
                            { $match: { "building_docs._id": mongoose.Types.ObjectId(obj.buildingId), status: true } },
                            { $group: { _id: { "building_Id": "$building_docs._id", "timezone": "$building_docs.timezone" }, BleId: { $push: "$bles_docs._id" }, "total": { $sum: 1 } } },
                            { $project: { "bleId": "$BleId", "timezone": "$_id.timezone", "building_Id": "$_id.building_Id", "total": "$total", _id: 0 } }
                        ]);
                        // console.log(result, "deskCout", obj)
                        timezone = result[0].timezone;
                        startm = moment.tz(timezone).startOf('day');
                        endm = moment.tz(moment(), timezone);
                    }
                    if (key == false) {
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
                        result = await db[obj.subdomain].sensorToBles.aggregate([
                            { $lookup: { from: "bles", localField: "bleId", foreignField: "_id", as: "bles_docs" } }, { $unwind: "$bles_docs" },
                            { $lookup: { from: "floors", localField: "floorId", foreignField: "_id", as: "floors_docs" } }, { $unwind: "$floors_docs" },
                            { $lookup: { from: "seats", localField: "seatId", foreignField: "_id", as: "seats_docs" } }, { $unwind: "$seats_docs" },
                            { $lookup: { from: "buildings", localField: "floors_docs.buildingId", foreignField: "_id", as: "building_docs" } }, { $unwind: "$building_docs" },
                            { $match: { status: true, "building_docs._id": buildingM } },
                            { $group: { _id: { "building_Id": "$building_docs._id", "timezone": "$building_docs.timezone" }, BleId: { $push: "$bles_docs._id" }, "total": { $sum: 1 } } },
                            { $project: { "bleId": "$BleId", "timezone": "$_id.timezone", "building_Id": "$_id.building_Id", "total": "$total", _id: 0 } }
                        ]);
                    }
                    var sendArray = [],
                        count = 0,
                        lengthCount = 0,
                        struc = {};
                    struc.working = 0;
                    struc.building = "";
                    struc.installed = 0;
                    if (result.length > 0) {
                        for (building of result) {
                            count = 0;
                            timezone = building.timezone;
                            startm = moment.tz(timezone).startOf('day');
                            endm = moment.tz(moment(), timezone);
                            var struc = {};
                            struc.working = building.total;
                            struc.building = building.building_Id;
                            blesTotalCount = await db[obj.subdomain].sensorToBles.aggregate([
                                { $lookup: { from: "floors", localField: "floorId", foreignField: "_id", as: "floors_docs" } }, { $unwind: "$floors_docs" },
                                { $lookup: { from: "bles", localField: "bleId", foreignField: "_id", as: "bles_docs" } }, { $unwind: "$bles_docs" },
                                { $lookup: { from: "buildings", localField: "floors_docs.buildingId", foreignField: "_id", as: "building_docs" } }, { $unwind: "$building_docs" },
                                { $match: { "building_docs._id": mongoose.Types.ObjectId(building.building_Id) } },
                                { $group: { _id: null, "total": { $sum: 1 } } },
                                { $project: { total: "$total", _id: 0 } }
                            ]);
                            if (blesTotalCount.length > 0) {
                                struc.installed = blesTotalCount[0].total;
                            }
                            sendArray.push(struc);
                            multi.rpush(`getDeskCount-${obj.subdomain}-${objC.username}-${key}`, JSON.stringify(struc));
                        }
                    } else {
                        sendArray.push(struc);
                        multi.rpush(`getDeskCount-${obj.subdomain}-${objC.username}-${key}`, JSON.stringify(struc));
                    }
                    await multi.exec(async(err, res) => {
                        err ? console.error(err, "error") : await client.expire(`getDeskCount-${obj.subdomain}-${objC.username}-${key}`, 600);
                    });
                    res.send(sendArray);
                } catch (e) {
                    console.log(e.message)
                    res.send(e.message)
                }

            } else {
                res.status(400).send({ error: "no authToken matched " })
            }
        }
    });


}

async function gethealthLogBulk(subdomain, startm, endm, bleIds) {
    let d = await db[subdomain].sensorHealthLogs.aggregate([
        { $match: { sensorId: { $in: bleIds }, time: { $gte: new Date(startm.valueOf()), $lte: new Date(endm.valueOf()) } } },
        { $group: { _id: "$sensorId", working: { $sum: 1 } } }
    ])
    return d;
}




async function gethealthLog(subdomain, startm, endm, bleId) {
    var d = await db[subdomain].sensorHealthLogs.countDocuments({
        time: {
            $gte: new Date(startm.valueOf()),
            $lte: new Date(endm.valueOf())
        },
        sensorId: bleId
    })
    return d;
}
async function getStartDate(obj, bleId) {
    try {
        var d = await db[obj.subdomain].sensorHealthLogs.find({ sensorId: bleId }, { time: 1, _id: 0 }).sort({ time: 1 }).limit(1);
        if (d.length > 0) {
            return d[0].time;
        } else {
            return new Date(0)
        }
    } catch (e) {
        console.log(e.message)
    }
}