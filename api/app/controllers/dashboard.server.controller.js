var db = require('../../config/mongoose'),
    jwt = require('jsonwebtoken');
var moment = require('moment-timezone');
var _ = require('lodash');
const redis = require('redis');
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient({ port: REDIS_PORT, detect_buffers: true });
client.on("error", function(err) {
    console.log("Error " + err);
})

exports.sendSensorConfig = (req, res, next) => {
    var obj = req.body;
    // console.log(obj)
    db['localhost'].siteconfigs.findOneAndUpdate({ buildings: mongoose.Types.ObjectId(obj.buildings), salesTypes: obj.salesTypes }, obj, { upsert: true, new: true }, (err, logs) => {
        if (err)
            console.log(err)
        else {
            console.log(" Response From getSensorConfig");
            res.send(logs)
        }
    })
}

// exports.getSensorConfig = async(req, res, next) => {
//     try {
//         var obj = req.body;
//         var result = await db['localhost'].siteconfigs.aggregate([
//             { "$match": { "sensorTypes": obj.type } },
//             { "$group": { _id: { sensorTypes: "$sensorTypes" }, sum: { $sum: "$quanityNo" } } },
//             {
//                 "$project": {
//                     "sensorTypes": "$_id.sensorTypes",
//                     "_id": 0,
//                     "sum": "$sum",
//                     "percent": {
//                         "$concat": [{ "$substr": [{ "$multiply": [{ "$divide": ["$sum", 10500] }, 100] }, 0, 4] }, "", ""]
//                     }
//                 }
//             }
//         ]);
//         console.log(" Response From getSensorConfig");
//         res.send(result)
//     } catch (e) {
//         console.log(e.message)
//         res.send(e)
//     }
// }

exports.getSensorConfigTable = async(req, res, next) => {

    try {
        let siteData = await db['localhost'].siteconfigs.aggregate([
            { "$group": { _id: { "siteName": "$siteName", "sensorTypes": "$sensorTypes", "salesTypes": "$salesTypes" }, total: { "$sum": "$quanityNo" } } }
        ])
        if (siteData.length > 0) {
            var count = 0;
            var resArray = [];
            siteData.forEach(s => {
                let struc = {};
                let site = s._id;
                if (site.sensorTypes == "Desk") {
                    struc.siteName = site.siteName,
                        struc.deskCount = s.total,
                        struc.novaCount = 0,
                        struc.host = 0,
                        struc.dlOccuSenCount = 0,
                        struc.wlad = 0,
                        struc.orderOrDemo = site.salesTypes
                }
                if (site.sensorTypes == "Nova") {
                    struc.siteName = site.siteName,
                        struc.deskCount = 0,
                        struc.novaCount = s.total,
                        struc.host = 0,
                        struc.dlOccuSenCount = 0,
                        struc.wlad = 0,
                        struc.orderOrDemo = site.salesTypes
                }
                if (site.sensorTypes == "Host") {
                    struc.siteName = site.siteName,
                        struc.deskCount = 0,
                        struc.novaCount = 0,
                        struc.host = s.total,
                        struc.dlOccuSenCount = 0,
                        struc.wlad = 0,
                        struc.orderOrDemo = site.salesTypes
                }
                if (site.sensorTypes == "Day Light/Occupancy") {
                    struc.siteName = site.siteName,
                        struc.deskCount = 0,
                        struc.novaCount = 0,
                        struc.host = 0,
                        struc.dlOccuSenCount = s.total,
                        struc.wlad = 0,
                        struc.orderOrDemo = site.salesTypes
                }
                if (site.sensorTypes == "WLAD") {
                    struc.siteName = site.siteName,
                        struc.deskCount = 0,
                        struc.novaCount = 0,
                        struc.host = 0,
                        struc.dlOccuSenCount = 0,
                        struc.wlad = s.total,
                        struc.orderOrDemo = site.salesTypes
                }
                ++count;
                resArray.push(struc)
                if (count == siteData.length) {
                    console.log(" Response From Localhost");
                    res.send(resArray)
                }

            })
        }
    } catch (e) {
        console.log(e.message)
    }
}


exports.getDomainListCache = async(req, res, next) => {
    try {
        let obj;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            obj = Object.assign({}, decoded);
        });
        await client.lrange(`getDomainList-${obj.username}`, 0, -1, (err, data) => {
            // console.log(err, data, "multirang");
            if (data.length > 0) {
                res.send(data);
            } else {
                console.log(err)
                next();
            }
        })
    } catch (e) {
        console.error(e)
    }
}

exports.getDomainList = async(req, res, next) => {
    try {
        let multi = client.multi();
        let obj;
        jwt.verify(req.authToken, req.config.tokenSecret, async(err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            obj = Object.assign({}, decoded);
            const result = await db['localhost'].users.findOne({ username: obj.username, password: obj.password }, { _id: 0, Buildings: 1, isAdmin: 1, isActive: 1 });
            if (typeof result !== 'undefined') {
                if (result.isAdmin == true) {
                    for (let t of global.domainData) {
                        multi.rpush(`getDomainList-${obj.username}`, t);
                    };
                    await multi.exec((err, res) => {
                        err ? console.error(err, "error") : client.expire(`getDomainList-${obj.username}`, 600);
                    });
                    await res.send(global.domainData);
                } else {
                    let temp = await getUnique(result.Buildings);
                    for (let t of temp) {
                        multi.rpush(`getDomainList-${obj.username}`, t);
                    }
                    await multi.exec((err, res) => {
                        err ? console.error(err, "error") : client.expire(`getDomainList-${obj.username}`, 600);
                    });
                    await res.send(temp);
                }
            } else {
                res.status(403).send()
            }
        });
    } catch (e) {
        console.log(e.message, "err");
        res.status(400).send({ err: e.message })
    }

};
exports.getUserBuildings = async(req, res, next) => {
    try {
        res.send(exports.Buildings)
    } catch (e) {
        console.log(e.message)
    }
}

exports.getlocalDbCountCache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getlocalDbCount-${obj.siteName}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                console.log(err, "not cached so Orginal Request LOCALDB", obj.siteName)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getlocalDbCount = async(req, res, next) => {
    try {
        let multi = client.multi();
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
        });
        let result = await db['localhost'].users.findOne({ username: objC.username, password: objC.password }, { password: 1, _id: 0, Buildings: 1 });
        let pass = result.password === objC.password;
        if (pass == true) {
            let Buildings = result.Buildings;
            const obj = req.body;
            let builg = [],
                buildingM;
            if (Buildings.length > 0) {
                Buildings.map((b) => {
                    if (b.subdomain === obj.siteName)
                        builg.push(b.id)
                })
                buildingM = { $in: builg };
            } else {
                buildingM = { $nin: builg };
            }
            let resultLoc = await db['localhost'].siteconfigs.find({ siteName: obj.siteName, buildings: buildingM });
            if (resultLoc.length > 0) {
                for (let t of resultLoc) {
                    multi.rpush(`getlocalDbCount-${obj.siteName}`, JSON.stringify(t));
                }
            }
            multi.exec((err, res) => {
                err ? console.error(err, "error") : client.expire(`getlocalDbCount-${obj.siteName}`, 600);
            })
            console.log(` Dashboard Response From ${obj.siteName}`);
            res.send(resultLoc)
        } else {
            res.status(400).send({ error: "no authToken matched " })
        }
    } catch (e) {
        res.send(e.message)
    }


}

exports.getHostCountCache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getHostCount-${obj.subdomain}-${obj.key}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                let finalArray = [];
                for (let t of data) {
                    finalArray.push(JSON.parse(t))
                }
                res.send(finalArray);
            } else {
                // console.log(err, "not cached so Orginal Request HOSTCOUNT", obj.subdomain)
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}


exports.getHostCount = async(req, res, next) => {

    try {
        let multi = client.multi();
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, async(err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            } else {
                objC = Object.assign({}, decoded);
                const resultT = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
                let pass = resultT.password === objC.password;
                if (pass == true) {
                    let Buildings = resultT.Buildings;
                    var sendArray = [];
                    let key = req.body.key;
                    let obj = req.body;
                    let result;
                    var startm;
                    var endm;
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


                    if (key == true) {
                        result = await db[req.body.subdomain].hosts.aggregate([
                            { $lookup: { from: "buildings", localField: "buildingId", foreignField: "_id", as: "building_docs" } }, { $unwind: "$building_docs" },
                            { $match: { buildingId: mongoose.Types.ObjectId(req.body.buildingId) } },
                            { $project: { "timezone": "$building_docs.timezone", buildingId: 1, _id: 1 } }
                        ])
                    }
                    if (key == false) {
                        result = await db[req.body.subdomain].hosts.aggregate([
                            { $lookup: { from: "buildings", localField: "buildingId", foreignField: "_id", as: "building_docs" } }, { $unwind: "$building_docs" },
                            { $match: { buildingId: buildingM } },
                            { $project: { "timezone": "$building_docs.timezone", buildingId: 1, _id: 1 } }
                        ]);
                    }
                    var sendArray = [],
                        lengthCount = 0;
                    let counter = 0;
                    if (result.length > 0) {
                        for await (let r of result) {
                            startm = moment.tz(r.timezone).startOf('day');
                            endm = moment.tz(moment(), r.timezone);
                            let minutes = Math.round(moment.duration('' + endm.hour() + ':' + endm.minutes()).asMinutes());
                            var struc = {};
                            struc.installed = result.length;
                            if (key == true) {
                                struc.building = mongoose.Types.ObjectId(r.buildingId)
                            }
                            let response = await gethostLogs(req.body.subdomain, r._id, startm, endm)
                            if (response > (Math.round((minutes / 10) / 2))) {
                                ++counter;
                            }
                            struc.working = counter;
                            if (result.length == ++lengthCount) {
                                struc.customer = req.body.subdomain;
                                sendArray.push(struc);
                                await multi.rpush(`getHostCount-${req.body.subdomain}-${key}`, JSON.stringify(struc));
                                multi.exec((err, res) => {
                                    err ? console.error(err, "error") : client.expire(`getHostCount-${obj.subdomain}-${key}`, 600);
                                })
                                console.log("Dashboard Response From getHostCount");
                                res.send(sendArray);
                            }
                        }
                    }

                } else {
                    res.status(400).send({ error: "no authToken matched " })
                }
            }
        });


    } catch (e) {
        console.log(e.message)
        res.send(e.message)
    }

}

async function gethostLogs(subdomain, hostId, startm, endm) {
    let d = await db[subdomain].hostLogs.countDocuments({ hostId: hostId, lastUpdated: { $gte: new Date(startm), $lte: new Date(endm) } })
    return d;
}


exports.getLocalSiteConfig = async(req, res, next) => {
    try {
        let obj = req.body
        let result = await db['localhost'].siteconfigs.find({ buildings: mongoose.Types.ObjectId(obj.buildingId) });
        console.log("Dashboard Response From getLocalSiteConfig");
        res.send(result)
    } catch (e) {
        res.send(e.message)
    }
}

exports.getLocalSiteConfigSiteWise = async(req, res, next) => {
    try {
        let obj = req.body;

        let result = await db['localhost'].siteconfigs.find({ siteName: obj.siteName });
        console.log("Dashboard Response From getLocalSiteConfigSiteWise");
        res.send(result)
    } catch (e) {
        res.send(e.message)
    }
}

async function getUnique(array) {
    var uniqueArray = [];

    // Loop through array values
    for await (var value of array) {
        // console.log("value", uniqueArray.indexOf(value.subdomain))
        if (uniqueArray.indexOf(value.subdomain) === -1) {
            uniqueArray.push(value.subdomain);
        }
    }
    return uniqueArray;
}