let db = require('../../config/mongoose'),
    jwt = require('jsonwebtoken');
var _ = require('lodash');
let moment = require('moment-timezone');
const redis = require('redis');
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient({ port: REDIS_PORT });
client.on("error", function(err) {
    console.log("Error " + err);
})
exports.getUnhealthyHosts = async(req, res, nexrt) => {
    res.setTimeout(500000);
    let finalArray = [];
    try {
        if (global.domainData.length > 0) {
            for (let building of global.domainData) {
                let hostData = await db[building].hostLogs.aggregate([
                    { $lookup: { from: "hosts", localField: "hostId", foreignField: "_id", as: "hosts_docs" } }, { $unwind: "$hosts_docs" },
                    {
                        $group: {
                            _id: { hostId: "$hosts_docs._id" },
                            hostName: { $first: "$hosts_docs.name" },
                            floor: { $first: "$hosts_docs.floorId" },
                            buildingId: { $first: "$hosts_docs.buildingId" },
                            maxTime: { $max: "$lastUpdated" }
                        }
                    },
                    { $lookup: { from: "buildings", localField: "buildingId", foreignField: "_id", as: "building_docs" } }, { $unwind: "$building_docs" },
                    { $lookup: { from: "floors", localField: "floor", foreignField: "_id", as: "floors_docs" } }, { $unwind: "$floors_docs" },
                    { $project: { hostId: "$_id.hostId", hostName: "$hostName", maxTime: "$maxTime", buildingName: "$building_docs.alias", floorName: "$floors_docs.alias", timeZone: "$building_docs.timezone", _id: 0 } }
                ]);
                let pObj = { siteName: building, hosts: [] }
                if (hostData.length > 0) {
                    for (let h of hostData) {
                        let obj = {};
                        let time = moment(moment(moment.tz(h.timeZone).valueOf()).subtract(30, 'minutes')).valueOf()
                        let maxTime = moment.tz(h.maxTime, h.timeZone).valueOf();
                        if (maxTime < time) {
                            obj.status = false;
                        } else {
                            obj.status = true;
                        }


                        let DblesCount = await db[building].bles.countDocuments({ hostId: h.hostId, hasOccupancy: true });
                        let PblesCount = await db[building].bles.countDocuments({ hostId: h.hostId, hasDensity: true });
                        obj.desk = DblesCount > 0 ? true : false;
                        obj.nova = PblesCount > 0 ? true : false;
                        obj.hostName = h.hostName;
                        obj.lastResponse = moment.tz(h.maxTime, h.timezone).format("DD-M-YYYY hh:mm A");
                        obj.timeZone = h.timeZone
                        obj.buildingName = h.buildingName;
                        obj.floorName = h.floorName;
                        if (obj.status == false) {
                            pObj.hosts.push(obj);
                            console.log(obj, "data")
                        }
                        // console.log(obj)
                    }
                    if (pObj.hosts.length > 0) {
                        finalArray.push(pObj)
                    }
                    console.log("Response get from getUnhealthyHosts =", building);
                }
            }
            // return finalArray;
        }
        console.log("Done");
        // res.send(finalArray)
        // console.log(finalArray)
        res.json({ data: await sendMails(finalArray) });
    } catch (e) {
        console.log(e.message, "getUnhealthyHosts")
    }
}



sendMails = async function(result) {
    let obj;
    var nodemailer = require('nodemailer');
    var SMTPTransport = require("nodemailer-smtp-transport")

    try {
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
            from: "Adappt NOC <admin@adappt.com>",
            to: 'support@adappt.com',
            subject: ` Host Issues`,
            html: ``
        };


        if (result.length > 0) {
            let data = [];
            for (let o of result) {
                // if (o.status == false) {
                mailOptions.html = '<html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title></title><link rel="stylesheet" href=""></head><body><header id="header" class=""></header><content><div style="background:#f9f9f9;color:#373737;font-family:Helvetica,Arial,sans-serif;font-size:17px;line-height:24px;max-width:100%;width:100%!important;margin:0 auto;padding:0"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;margin:0;padding:0;width:100%;font-size:17px;color:#373737;background:#f9f9f9"><tbody><tr><td valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tbody><tr><td valign="bottom" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;padding:20px 16px 12px"><div style="text-align:center"><a href="#" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word" target="_blank" data-saferedirecturl="#"><img src="https://barclays.adapptonline.com/img/adappt.png" width="228" height="56" style="outline:none;text-decoration:none;border:none" class="CToWUd"></a></div></td></tr></tbody></table></td></tr><tr><td valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table cellpadding="32" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background:white;border-radius:0.5rem;margin-bottom:1rem"><tbody><tr><td width="650" valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><div style="max-width:650px;margin:0 auto"><h2 style="color:#3a3b3c;line-height:30px;margin-bottom:12px;margin:0 auto 2rem;font-size:1.8rem;text-align:center">Host Status Update:</h2><h3 style="color:#3a3b3c;line-height:26px;margin-bottom:2rem;font-size:1.2rem;text-align:center;margin:0 auto 1rem">The Host mentioned below need to be checked</h3><ul style="display: inline-block;color:#3a3b3c;line-height:26px;margin-bottom:2rem;text-align:center;margin:0 auto 1rem;padding-inline-start: 25px;">';
                mailOptions.html += '<h4 style="color:#3a3b3c;line-height:26px;margin-bottom:2rem;font-size:1.2rem;text-align:center;margin:0 auto 1rem">' + o.siteName + '</h4>';
                mailOptions.subject += ' ' + o.siteName;
                o.hosts.forEach(async f => {
                    mailOptions.html += '<div style="background: white;border-radius: 8px;box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);cursor: pointer;height: 201px;padding: 0 20px;position: relative;-webkit-tap-highlight-color: rgba(0, 0, 0, 0.025);text-align: center;transition: height 1000ms;width: 560px;">'
                    mailOptions.html += '<li style="text-align: justify;margin-left: 17px;">    <b>Building Name</b> : ' + f.buildingName + '</li><li style="text-align: justify;margin-left: 17px;">    <b>Floor Name</b> :' + f.floorName + '</li><li style="text-align: justify;margin-left: 17px;">    <b>Host Name</b> : ' + f.hostName + '</li><li style="text-align: justify;margin-left: 17px;">    <b>Host Last Respnse</b> : ' + f.lastResponse + ' <b> | ' + f.timeZone + ' </b> </li><li style="text-align: justify;margin-left: 17px;"><b>Devices</b><ul><li><b>Desk</b> :' + f.desk + '</li><li><b>Nova</b> :' + f.nova + ' </li></ul></li>'
                    mailOptions.html += '</div></ul><hr>';
                })
                mailOptions.html += '</div></td></tr></tbody></table></td>'
                mailOptions.html += '</tr><tr><td style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin-top:1rem;background:white;color:#989ea6"><tbody><tr><td style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;height:5px;background-image:url("#");background-repeat:repeat-x;background-size:auto 5px"></td></tr><tr><td valign="top" align="center" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;padding:16px 8px 24px"><div style="max-width:600px;margin:0 auto"><p style="font-size:12px;line-height:20px;margin:0 0 16px;margin-top:16px">Made by <a href="www.adappt.com" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word" target="_blank" data-saferedirecturl="www.adappt.com">Adappt Intelligence</a><br/><a href="www.adappt.com" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word;text-align: center;" target="_blank" data-saferedirecturl="www.adappt.com" >All Rights Reserved by &copy; Adappt </a></p></div></td></tr></tbody></table></td></tr></tbody></table></div></content></body></html>';
                smtpTransport.sendMail(mailOptions, await
                    function(error, response) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(" localhost response from sendMails", response.accepted[0]);
                            data.push({ mailId: response.accepted[0] });
                        }
                    });
                mailOptions.html = ``;
                mailOptions.subject = ` Host Issues`;
            }
            return data;
        }
    } catch (e) {
        console.log(e.message, "sendMails")
    }



}



exports.hostHealthLogsCountByTime = async(subdomain, fromDate, toDate, hostName) => {
    let arrayData = 0;
    try {
        arrayData = await db[subdomain].hostLogs.countDocuments({ lastUpdated: { $gt: fromDate, $lte: toDate }, hostId: mongoose.Types.ObjectId(hostName) });
        return arrayData;
    } catch (e) {
        console.log(e.message);
        return arrayData;
    }


}



exports.unhealthyhostsData = async(req, subdomain, fromDate, toDate) => {
    let finalArray = [];
    try {
        let multi = client.multi();
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
        });
        const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
        let pass = result.password === objC.password;
        if (pass == true) {
            let Buildings = result.Buildings;
            let builg = [],
                buildingM;
            if (Buildings.length > 0) {
                Buildings.map((b) => {
                    if (b.subdomain === subdomain)
                        builg.push(mongoose.Types.ObjectId(b.id))
                })
                buildingM = { $in: builg };
            } else {
                buildingM = { $nin: builg };
            };
            let hostData = await db[subdomain].hosts.aggregate([
                { $lookup: { from: "buildings", localField: "buildingId", foreignField: "_id", as: "building_docs" } }, { $unwind: "$building_docs" },
                { $match: { "building_docs._id": buildingM } },
                { $lookup: { from: "floors", localField: "floorId", foreignField: "_id", as: "floors_docs" } }, { $unwind: "$floors_docs" },
                {
                    $project: {
                        hostId: "$_id",
                        hostName: "$name",
                        buildingName: "$building_docs.alias",
                        floorName: "$floors_docs.alias",
                        timeZone: "$building_docs.timezone",
                        _id: 0
                    }
                }
            ]).allowDiskUse(true);
            if (hostData.length > 0) {
                for (let h of hostData) {
                    let obj = {};


                    var startm = moment.tz(h.timeZone).startOf('day').format();
                    var endm = moment.tz(h.timeZone).endOf('day').format();
                    var momentstart = moment.tz(fromDate, h.timeZone).startOf('day').format();
                    var momentend = moment.tz(toDate, h.timeZone).subtract(1, 'day').endOf('day').format();



                    let timethirtyM = moment(moment(moment.tz(h.timeZone).valueOf()).subtract(30, 'minutes')).valueOf();
                    let hostLTime = await db[subdomain].hostLogs.findOne({ hostId: h.hostId }, { lastUpdated: 1, _id: 0 }).sort({ lastUpdated: -1 }).limit(1);
                    let hostFTime = await db[subdomain].hostLogs.findOne({ hostId: h.hostId }, { lastUpdated: 1, _id: 0 }).sort({ lastUpdated: 1 }).limit(1);
                    let maxTime = moment.tz(hostLTime.lastUpdated, h.timeZone).valueOf();
                    let statusObj = {};
                    obj.status = [];
                    if (maxTime < timethirtyM) {
                        statusObj.status30m = false;
                    } else {
                        statusObj.status30m = true;
                    }
                    let timeOneD = moment(moment(moment.tz(h.timeZone).valueOf()).subtract(1, 'days')).valueOf()
                    if (maxTime < timeOneD) {
                        statusObj.status1D = false;
                    } else {
                        statusObj.status1D = true;
                    }
                    let timeOneW = moment(moment(moment.tz(h.timeZone).valueOf()).subtract(7, 'days')).valueOf()
                    if (maxTime < timeOneW) {
                        statusObj.status1W = false;
                    } else {
                        statusObj.status1W = true;
                    }
                    obj.status.push(statusObj);
                    obj.hostlogtodaycount = await exports.hostHealthLogsCountByTime(subdomain, startm, endm, h.hostId);
                    obj.hostlogtimespecifed = await exports.hostHealthLogsCountByTime(subdomain, momentstart, momentend, h.hostId);
                    let DblesCount = await db[subdomain].bles.countDocuments({ hostId: h.hostId, hasOccupancy: true });
                    let PblesCount = await db[subdomain].bles.countDocuments({ hostId: h.hostId, hasDensity: true });
                    obj.sitename = subdomain;
                    obj.id = h.hostId;
                    obj.firstresponse = moment.tz(hostFTime.lastUpdated, h.timeZone).format("DD-M-YYYY hh:mm A");
                    obj.desk = DblesCount;
                    obj.nova = PblesCount;
                    obj.hostname = h.hostName;
                    obj.lastresponse = moment.tz(maxTime, h.timeZone).format("DD-M-YYYY hh:mm A");
                    obj.timezone = h.timeZone
                    obj.buildingname = h.buildingName;
                    obj.floorname = h.floorName;
                    multi.rpush(`getHostLogsData-${subdomain}`, JSON.stringify(obj));
                    finalArray.push(obj);
                }
                console.log("Response get from getHostLogsData =", subdomain);
                multi.exec(async(err, res) => {
                    err ? console.error(err, "error") : await client.expire(`getHostLogsData-${subdomain}`, 600);
                });
            }
            return finalArray;

        } else {
            res.status(400).send({ error: "no authToken matched " })
        }

    } catch (e) {
        console.log(e.message, subdomain);
        return finalArray;
    }

}


// exports.getHostLatestTime = async(subdomain, hostId) => {
//     // console.log(subdomain, hostId, "hostId")
//         let hostTime = await db[subdomain].hostlogs.find({ hostId: hostId }, { lastUpdated: 1, _id: 0 }).sort({ lastUpdated: -1 }).limit(1);
//         return hostTime.lastUpdated;
// }

exports.getHostUnhelathyTrendcache = async(req, res, next) => {
    try {
        let obj = req.body;
        let timeType = obj.favoriteType;
        let type = obj.selecttype;
        var endDate = await db[obj.subdomain].hostLogs.find({}, { lastUpdated: 1, _id: 0 }).sort({ lastUpdated: -1 }).limit(1);
        var mEnd = moment.utc(moment.tz(endDate[0].lastUpdated, obj.timezone));
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
        await client.lrange(`getHostUnhelathyTrend-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err, "HOST getHostUnhelathyTrend", data)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getHostUnhelathyTrend = async(req, res, next) => {
    try {
        console.log(" gethealthcount is processing");
        var obj = req.body;
        var type = req.body.selecttype;
        let timeType = req.body.favoriteType;
        let mStart = null;
        let multi = client.multi();
        var endDate = await db[obj.subdomain].hostLogs.find({}, { lastUpdated: 1, _id: 0 }).sort({ lastUpdated: -1 }).limit(1);
        var mEnd = moment.utc(moment.tz(endDate[0].lastUpdated, obj.timezone));
        res.setTimeout(500000);
        if (timeType == 'LastWeek') {
            mStart = moment(moment(mEnd.valueOf()).subtract(1, 'week')).utc();
        }
        if (timeType == 'LastMonth') {
            mStart = moment(moment(mEnd.valueOf()).subtract(1, 'month')).utc();
        }
        if (timeType == 'FromBeginning') {
            mStart = moment(moment.tz(obj.selectedDate.begin, obj.timezone)).utc();
            mEnd = moment(moment.tz(obj.selectedDate.end, obj.timezone)).utc();
        }

        let dates = [],
            qcounter = 0;
        const range = moment.range(mStart, mEnd);
        let diff = mEnd.diff(mStart, 'days');
        var floors = await db[obj.subdomain].buildings.find({ alias: obj.building }, { floors: 1, _id: 0 })
        let hostCount = [];
        if (type == "HOST") {
            hostCount = await db[obj.subdomain].hosts.find({ floorId: { $in: floors[0].floors } });
            hostCount = hostCount.map(host => host._id)
        }
        if (hostCount.length > 0) {
            for await (let dat of range.by('day')) {
                ++qcounter;
                dayStart = moment.utc(moment(dat.valueOf()).startOf('day'));
                dayEnd = moment.utc(moment(dat.valueOf()).endOf('day'));

                let match = {
                    $match: {
                        lastUpdated: {
                            $gte: new Date(dayStart.valueOf()),
                            $lte: new Date(dayEnd.valueOf())
                        },
                        hostId: { $in: hostCount }
                    }
                };
                let hostLogsCount = await db[obj.subdomain].hostLogs.aggregate([
                    match,
                    {
                        $project: {
                            _id: "$hostId",
                            day: { $dateToString: { format: '%d-%m-%Y', date: { $add: ['$lastUpdated', obj.timezoneOffset] } } },
                            hours: { $hour: { $add: ['$lastUpdated', obj.timezoneOffset] } },
                            minute: {
                                $subtract: [{ $minute: { $add: ['$lastUpdated', obj.timezoneOffset] } },
                                    { $mod: [{ $minute: { $add: ['$lastUpdated', obj.timezoneOffset] } }, 10] }
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
                    { $project: { hostId: "$_id.id", day: "$_id.day", count: "$sumday", _id: 0 } }
                ]);

                let newArray = [];
                for (host of hostCount) {
                    let temp = _.find(hostLogsCount, { 'hostId': host });
                    if (temp) {
                        newArray.push(temp)
                    } else {
                        newArray.push({ hostId: host, count: 0 })
                    }
                }


                if (newArray.length > 0) {
                    let fCounter = newArray.length,
                        fpending = 0;
                    let datatoPush = {};
                    datatoPush.day = new Date(dat);
                    datatoPush.total = hostCount.length;
                    datatoPush.notworking = 0;
                    datatoPush.working = 0;
                    for (let row of newArray) {
                        // console.log(row)
                        if (row.count < 108) {
                            ++datatoPush.notworking;
                        } else {
                            ++datatoPush.working;
                        }
                        if (++fpending == fCounter) {
                            // console.log(datatoPush)
                            dates.push(datatoPush);
                            multi.rpush(`getHostUnhelathyTrend-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, JSON.stringify(datatoPush));
                            if (qcounter == diff) {
                                multi.exec(async(err, res) => {
                                    err ? console.error(err, "error") : await client.expire(`getHostUnhelathyTrend-${obj.subdomain}-${type}-${timeType}-${mStart.format('MM/DD/YYYY')}-${mEnd.format('MM/DD/YYYY')}`, 600);
                                });
                                console.log(` unhealth trend data of ${diff} days responded`, qcounter);
                                // console.log(dates)
                                res.send(dates);
                            }
                        }
                    }

                } else {
                    datatoPush.day = new Date(dat);
                    datatoPush.notworking = 0;
                    datatoPush.working = 0;
                    dates.push(datatoPush)
                    multi.rpush(`getHostUnhelathyTrend-${obj.subdomain}`, JSON.stringify(datatoPush));
                    if (qcounter == diff) {
                        multi.exec(async(err, res) => {
                            err ? console.error(err, "error") : await client.expire(`getHostUnhelathyTrend-${obj.subdomain}`, 600);
                        });
                        console.log(` unhealth trend data of ${diff} days responded`)
                        res.send(dates);
                    }
                }
                // console.log(datatoPush)
            }
        }


    } catch (e) {
        console.log(e.message)
    }
}

exports.getHostLogsDatacache = async(req, res, next) => {
    try {
        let obj = req.body;
        await client.lrange(`getHostLogsData-${obj.subdomain}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err, "getHostLogsDatacache");
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}


exports.getHostLogsData = async(req, res, next) => {
    try {
        let obj = req.body;
        res.setTimeout(500000);
        let data = await exports.unhealthyhostsData(req, obj.subdomain, obj.FromDate, obj.ToDate);
        res.send(data)
    } catch (e) {
        console.log(e.message)
    }
}


exports.getObjectTimeStamp = async(req, res, next) => {
    try {
        let finalArray = [];
        let arrayData = await db['adobe'].bles.find({}, { _id: 1 }).sort({ _id: 1 }).limit(1);
        for (let d of arrayData) {
            let obj = {};
            obj.time = d._id.getTimestamp();
            obj.id = d._id;
            finalArray.push(obj)
        }
        res.send(finalArray)
    } catch (e) {
        console.log(e.message)
    }
}


exports.getHostComplaints = async(req, res, next) => {
    var obj = req.body;
    db['localhost'].pcsbleissues.aggregate([
        { $match: { bleId: mongoose.Types.ObjectId(obj.hostId) } },
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
            console.log(" localhost response from getHostComplaints");
            res.send(result)
        }

    })
}