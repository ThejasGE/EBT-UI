var db = require('../../config/mongoose');
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

exports.getPcsDatas = async function(req, res, next) {
    var count = 0;var sendArray = [];
    var dates = req.body;
    var bu = ['SGP-MBFC','Barclays Japan'];
    
    db[req.body.subdomain].roomToBles.aggregate([
        {$lookup:{from: "bles",localField: "bleId",foreignField: "_id",as: "bles_docs"} },{ $unwind: "$bles_docs"},
        {$lookup:{from: "floors",localField: "floorId",foreignField: "_id",as: "floors_docs"} },{ $unwind: "$floors_docs"},
        {$lookup:{from: "sections",localField: "roomId",foreignField: "_id",as: "sections_docs"} },{ $unwind: "$sections_docs"},
        {$lookup:{from: "buildings",localField: "floors_docs.buildingId",foreignField: "_id",as: "building_docs"} },{ $unwind: "$building_docs"},
        {$match: { "building_docs.alias":{ $in: bu}  }},
        { $project: { _id:1, "ble_address": "$bles_docs.address", "floor_name":"$floors_docs.alias","room_name":"$sections_docs.name", "building_name":"$building_docs.alias",
                lastUpdated:1, "bleId": "$bles_docs._id", "timezone":"$building_docs.timezone","timezoneoffset":"$building_docs.timezoneOffset"
            } }
    ],  function( err, roomUnCount){
        roomUnCount.forEach( async function(room,i){
            timezone = room.timezone;
            var startm = moment.tz(timezone).startOf('day').utc();
            var endm = moment.tz(timezone).endOf('day').utc();
            var momentstart = moment.tz(dates.FromDate,room.timezone).valueOf();
            var momentend = moment.tz(dates.ToDate,room.timezone).valueOf();
            var sendStruc = {};
            sendStruc.id= i,
            sendStruc.customers = req.body.subdomain,
            sendStruc.buildings = room.building_name,
            sendStruc.blgtimezone = room.timezone,
            sendStruc.blgoffset = room.timezoneoffset,
            sendStruc.floors = room.floor_name,
            sendStruc.bleaddress = room.ble_address,
            sendStruc.lastresponsetime = moment.tz(room.lastUpdated, room.timezone).format("DD-M-YYYY hh:mm A"),
            sendStruc.noofresponsesTillNow = await gethealthLog(req.body.subdomain, momentstart, momentend, room.bleId),
            sendStruc.bleId = room.bleId;
            sendStruc.roomName = room.room_name;
            sendStruc.noofresponses = await gethealthLog(req.body.subdomain,startm, endm, room.bleId)
            sendArray.push(sendStruc);
            // console.log(sendArray)
            if(roomUnCount.length == ++count){
                res.send(sendArray.sort(function(a,b){ return a.id - b.id}))
            }
        })
    })
}
async function gethealthLog(subdomain, startm,endm, bleId){
    var d = await db[subdomain].sensorHealthLogs.aggregate([{ $match:{ sensorId: mongoose.Types.ObjectId(bleId)},   },
    { $project: { "time": { $ifNull: [ "$time", new Date(startm) ] }, "sensorId":"$sensorId",_id:0 } },
    {$match: { "time": { $gte: new Date(startm),$lte:new Date(endm) }} },
    { $group: { "_id":{ "sensor_id":"$sensorId"}, count:{ $sum:1} } }
    ])
    if(d.length)
        return d[0].count
    else
        return 0
}

exports.gethealthcount = async function( req, res, next){
    // console.log(req.body)
    var obj = req.body;
    var startDate = await db[obj.subdomain].sensorHealthLogs.find({}, {time:1,_id:0}).sort({ time:1}).limit(1);
    var endDate =  await db[obj.subdomain].sensorHealthLogs.find({}, {time:1,_id:0}).sort({ time:-1}).limit(1);
    var mStart = moment.tz(startDate[0].time,obj.timezone).utc();
    var mEnd = moment.tz(endDate[0].time,obj.timezone).utc();
    res.setTimeout(500000);
    var dates = [], qcounter = 0;
    const range = moment.range(mStart, mEnd);
    // console.log(new Date(mEnd) - new Date(mStart))
    var diff = Math.round((new Date(mEnd) - new Date(mStart))/(1000*60*60*24));
    var floors =  await db[obj.subdomain].buildings.find({ alias: obj.building}, {floors:1,_id:0})

    var roomBles = await db[obj.subdomain].roomToBles.find({ floorId:{ $in: floors[0].floors}})



    roomBles = roomBles.map((room) => room.bleId);
    for (let dat of range.by('day')) {
            var s = new Date(dat)
             dayStart = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T'+'00:00:00',obj.timezone)
             dayEnd = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T'+'23:59:59',obj.timezone)
        var d =await db[obj.subdomain].sensorHealthLogs.aggregate([
                {$match:{ time: {
                    $gte: new Date(dayStart),
                    $lte: new Date(dayEnd)
                }, sensorId: {$in: roomBles} } },
                { $group:{ _id:"$sensorId", count:{$sum:1} } },
                { $match: { count: { $lte: 720}} },
                {$group:{_id:null,count:{$sum:1}}},
                {$project:{ _id:0, count:"$count"}}

            ])
        // var notadded = await db[obj.subdomain].sensorHealthLogs.aggregate([ {$match:{ time: {
        //     $gte: new Date(dayStart),
        //     $lte: new Date(dayEnd)
        // }, sensorId: {$nin: roomBles} } },{ $group:{ _id: "$sensorId", count:{$sum:1} } }])

        if(d.length){
            // console.log(dayStart, d[0].count)
            dates.push({ day: dayStart, count: d[0].count})
            if(++qcounter == diff){
                res.send(dates)
            }
        }
        else{
            dates.push({ day: dayStart, count: 0})
            if(++qcounter == diff){
                res.send(dates)
            }
        }   
    }
    
}




exports.getMinutesData =  async function(req, res, next) {
    var obj = req.body;
    var finaldata = {};
    
    // console.log(obj)
    var s = new Date(obj.FromDate),
        startm = moment.tz(s,obj.blgtimezone).startOf('day').utc(),
        endm = moment.tz(s,obj.blgtimezone).endOf('day').utc();

        // console.log(startm, endm,"dates",s)
        d = await db[obj.subdomain].sensorDatas.aggregate([
            { $match: { sensorId: mongoose.Types.ObjectId(obj.bleId), time: { $gte: new Date(startm), $lte: new Date(endm) } } },
            { $group: { _id: "$time", density: { $avg: "$density" }, time: { $first: "$time" }, sensorId: { $first: "$sensorId" } } },
            { $project: { sensorId: "$sensorId", time: "$time", density: "$density", _id: "$_id" } }
        ]),
        health = await db[obj.subdomain].sensorHealthLogs.aggregate([
            { $match: { sensorId: mongoose.Types.ObjectId(obj.bleId), time: { $gte: new Date(startm), $lte: new Date(endm) } } },
            { $group: { _id: {time: "$time", sensorId:"$sensorId" }, count: {$sum:1} } },
            ]);
        health.sort(function(a, b) { return a._id.time - b._id.time });
        d.sort(function(a, b) { return a.time - b.time });
    finaldata.health =  healthData(health, s,obj.blgtimezone);
    finaldata.minute = minuteData(d, s,obj.blgtimezone);
    finaldata.hour = HourData(d, s,obj.blgtimezone);
    finaldata.timezone = obj.blgtimezone;
    finaldata.subdomain = obj.subdomain;
    finaldata.roomName = obj.roomName;
    finaldata.bleAddress = obj.bleAddress;
    finaldata.floors = obj.floors;
    finaldata.fromDate = obj.FromDate;
    finaldata.buildings = obj.buildings;
    res.status(200).json(finaldata)
}

function healthData(health,s,timezone){
    var result = {}
    result.labels = []
    result.values = []
    if(health.length){
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 60; j++) {
                var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':00',timezone),
                    eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':59',timezone),
                    st = new Date(sTime),et = new Date(eTime)
                    // console.log(st, et)
                var resd = _.find(health, function(obj) {
                    if (obj._id.time.getTime() >= st.getTime() && (obj._id.time.getTime() <= et.getTime())){
                        return obj
                    }
                })
                if (resd != undefined)
                    result.values.push( Math.round(resd.count))
                else
                    result.values.push(0)
                result.labels.push(i.pad(2) + ':' + j.pad(2))
            }
        }
        return result;
    } else {
        for (var i = 0; i < 24; i++) {
            for (var j = 0; j < 60; j++) {
                var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':00',timezone),
                    eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':59',timezone);
                    result.labels.push(i.pad(2) + ':' + j.pad(2))
                    result.values.push(0)
            }
        }
        return result;
    }
    
    

}

function minuteData(d,s,timezone) {
    var result = {}
    result.labels = [];
    result.values = [];
    
    var todaydate = new Date(), td = todaydate.getTime(),sd = s.getTime(), diff = (td - sd / (24*60*60*1000) ),hour=0;
    if(diff > 1)
        hour = s.getHours()+1;
    else 
        hour = 24;

    for (var i = 0; i < 24; i++) {
        for (j = 0; j < 60; j++) {
            var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':00',timezone),
                eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':' + j.pad(2) + ':59',timezone),
                st = new Date(sTime),et = new Date(eTime)
            var resd = _.find(d, function(obj) {
                if ((obj.time.getTime() >= st.getTime()) && (obj.time.getTime() <= et.getTime())){
                    return obj
                }
                    
            })
            if (resd != undefined && resd !== null)
                result.values.push(Math.round(resd.density))
            else
                result.values.push(0)
            result.labels.push(i.pad(2) + ':' + j.pad(2))
        }
    }
    return result
}

function HourData(d,s,timezone) {
    var result = {}
    result.labels = []
    result.values = []
    for (var i = 0; i < 24; i++) {
        var sTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':00:00',timezone),
            eTime = moment.tz(s.getFullYear() + '-' + (parseInt(s.getMonth() + 1).pad(2)) + '-' + parseInt(s.getDate()).pad(2) + 'T' + i.pad(2) + ':59:59',timezone),
            st = new Date(sTime),et = new Date(eTime)
        var resd = _.find(d, function(obj) {
            if ((obj.time.getTime() >= st.getTime()) && (obj.time.getTime() <= et.getTime())){
                return obj
            }
                
        })
        if (resd != undefined){
            if(resd.density !== null)
                result.values.push(Math.round(resd.density))
            else
            result.values.push(0)
        }
        else
            result.values.push(0)
        result.labels.push(i.pad(2))
    }
    return result
}


exports.sendBleLogs = function( req, res, next) {
    try{
        // console.log("here")
        var obj =req.body;
    // console.log(obj,"obj")
    db['localhost'].pcsbleissues.findOneAndUpdate(
        {bleId: mongoose.Types.ObjectId(obj.bleId)},
        obj,
        {upsert: true, new: true},
        function(err, blelogs) {
            if(err)
                console.log(err)
                
            // console.log(blelogs,"blelogs")
            res.send(blelogs)   
        })
    }catch(e){
        console.log(e.message)
    }
}

exports.getBleLogs = function( req, res, next) {
    db['localhost'].pcsbleissues.find({},{ bleId:1,roomName:1,subject:1,comments:1}, function(err, pcslogs) {
        if (err)
            res.send(err)
        else {
            res.send(pcslogs);
        }
    })
}


exports.getBleSubject = function( req, res, next) {
    db['localhost'].pcsbleissues.distinct("subject", function(err, pcslogs) {
        if (err)
            res.send(err)
        else {
            // console.log(pcslogs)
            res.send(pcslogs);
        }
    })
}

exports.getBleLogsByRmName = function( req, res, next) {
    var obj = req.body;
    db['localhost'].pcsbleissues.find({roomName:obj.roomName},{ bleId:1,roomName:1,subject:1, comments:1}, function(err, pcslogs) {
        if (err)
            res.send(err)
        else {
            res.send(pcslogs);
        }
    })
}


exports.getBleLogsForMails = function( req, res, next) {
    var obj = req.body;
    db['localhost'].pcsbleissues.aggregate([
        { $match:{ bleaddress:obj.bleAddress} },
        { $group: { "_id":{subject: "$subject", customer:"$customers", building:"$buildings",  floor:"$floors"},
            "roomData": { "$push": { bleaddress:"$bleaddress", notes:"$comments", roomName:"$roomName" } },
        }},
            { $group: { "_id":{subject: "$_id.subject"}, Faults:{$push: {customer:"$_id.customer", 
                building:"$_id.building",floor:"$_id.floor", roomData:"$roomData"}}}},
                { $project:{ "subject":"$_id.subject", faults: "$Faults", _id:0  } }], function(err, result){
                    if(err)
                        console.log(err)
                    else{
                        // console.log(result)
                        res.send(result)
                    }
                    
                })
}


exports.sendMails = function( req, res, next) {
    var obj = req.body;
    // console.log(obj)
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
        to: 'dhamodar.p@adappt.com',
        subject: ` NOVA SENSORS ISSUES`,
        html: ``
    };
    mailOptions.html = '<html><head><meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><title></title><link rel="stylesheet" href=""></head><body><header id="header" class=""></header><content><div style="background:#f9f9f9;color:#373737;font-family:Helvetica,Arial,sans-serif;font-size:17px;line-height:24px;max-width:100%;width:100%!important;margin:0 auto;padding:0"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:24px;margin:0;padding:0;width:100%;font-size:17px;color:#373737;background:#f9f9f9"><tbody><tr><td valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tbody><tr><td valign="bottom" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;padding:20px 16px 12px"><div style="text-align:center"><a href="#" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word" target="_blank" data-saferedirecturl="#"><img src="http://barclaysdemo.adapptonline.com/img/adappt.png" width="150" height="56" style="outline:none;text-decoration:none;border:none" class="CToWUd"></a></div></td></tr></tbody></table></td></tr><tr><td valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table cellpadding="32" cellspacing="0" border="0" align="center" style="border-collapse:collapse;background:white;border-radius:0.5rem;margin-bottom:1rem"><tbody><tr><td width="650" valign="top" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><div style="max-width:650px;margin:0 auto"><h2 style="color:#3a3b3c;line-height:30px;margin-bottom:12px;margin:0 auto 2rem;font-size:1.8rem;text-align:center">PCS Status Update:</h2><h3 style="color:#3a3b3c;line-height:26px;margin-bottom:2rem;font-size:1.2rem;text-align:center;margin:0 auto 1rem">The PCS mentioned below need to be checked</h3><ul style="display: inline-block;">';
    


    obj.forEach( o => {
        mailOptions.html += '<li><b>' + o.subject + '</b></li>';
        // console.log(o.subject)
        o.faults.forEach( f => {
            mailOptions.html += '<ul style="display: inline-block;"><li> customer: <b>' + f.customer + '</b></li><li> building: <b>' + f.building + '</b></li><li> Floor: <b>' + f.floor + '</b></li> ';
            f.roomData.forEach( r => {
                mailOptions.html += '<ul style="display: inline-block;"><li> roomName: <b>' + r.roomName + '</b></li><li> bleaddress: <b>' + r.bleaddress + '</b></li><li> notes: <b>' + r.notes + '</b></li></ul>';
            })
        })
        mailOptions.html += '</ul>'
    })

    mailOptions.html += '</div></td></tr></tbody></table></td></tr><tr><td style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse"><table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="border-collapse:collapse;margin-top:1rem;background:white;color:#989ea6"><tbody><tr><td style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;height:5px;background-image:url("#");background-repeat:repeat-x;background-size:auto 5px"></td></tr><tr><td valign="top" align="center" style="font-family:Helvetica,Arial,sans-serif!important;border-collapse:collapse;padding:16px 8px 24px"><div style="max-width:600px;margin:0 auto"><p style="font-size:12px;line-height:20px;margin:0 0 16px;margin-top:16px">Made by <a href="www.adappt.com" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word" target="_blank" data-saferedirecturl="www.adappt.com">Adappt Intelligence</a><br/><a href="www.adappt.com" style="color:#439fe0;font-weight:bold;text-decoration:none;word-break:break-word;text-align: center;" target="_blank" data-saferedirecturl="www.adappt.com" >All Rights Reserved by &copy; Adappt </a></p></div></td></tr></tbody></table></td></tr></tbody></table></div></content></body></html>';
    
    
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            // console.log("Mail error");
            console.log(error);
        } else {
            // console.log(response);
            res.send({ mailId:response.accepted[0]});
        }
    });
}




