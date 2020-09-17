var db = require('../../config/mongoose'),
    jwt = require('jsonwebtoken');
const redis = require('redis');
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient({ port: REDIS_PORT });
client.on("error", function(err) {
    console.log("Error " + err);
})


exports.getbuildingscache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getbuildings-${obj.subdomain}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                res.send(JSON.parse(data));
            } else {
                console.log(err, "getbuildings")
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getbuildings = async function(req, res, next) {
    let obj;
    jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
        if (err)
            res.status(403).send({ err });
        objC = Object.assign({}, decoded);
    });
    let multi = client.multi();
    const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
    let pass = result.password === objC.password;
    if (pass == true) {
        let bu = ['SGP-MBFC', 'Barclays Japan'];
        let obj = req.body;
        let Buildings = result.Buildings;
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

        db[obj.subdomain].buildings.find({ alias: { $nin: bu }, _id: buildingM }, { alias: 1, _id: 1, timezone: 1, timezoneOffset: 1 }, async function(err, buildings) {
            if (err)
                res.send(err)
            else {
                try {
                    let buildingObj = { name: req.body.subdomain, buildings: buildings, disabled: false, isRoom: false, isSegment: false }
                    let rooms = await db[obj.subdomain].roomToBles.countDocuments({});
                    let segments = await db[obj.subdomain].segmentToBles.countDocuments({});
                    buildingObj.isRoom = rooms > 0 ? true : false;
                    buildingObj.isSegment = segments > 0 ? true : false;
                    await multi.rpush(`getbuildings-${obj.subdomain}`, JSON.stringify(buildingObj));
                    multi.exec((err, res) => {
                        err ? console.error(err, "error") : client.expire(`getbuildings-${obj.subdomain}`, 600);
                    });
                    res.send(buildingObj);

                } catch (e) {
                    console.log(e.message)
                }
            }
        });
    } else {
        res.status(400).send({ error: "no authToken matched " })
    }
}
exports.getbarcFewbuildings = function(req, res, next) {
    // console.log(req.body)
    var bu = ['SGP-MBFC', 'Barclays Japan'];
    db[req.body.subdomain].buildings.find({ alias: { $in: bu } }, { alias: 1, _id: 1, timezoneOffset: 1, timezone: 1 }, function(err, buildings) {

        if (err)
            res.send(err)
        else {
            // console.log(buildings)
            res.send({ name: req.body.subdomain, buildings: buildings, disabled: false });
        }
    });
}

exports.getbuildingsAllcache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getbuildingsAll-${obj.subdomain}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                res.send(JSON.parse(data));
            } else {
                console.log(err, "getbuildingsAll")
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}


exports.getbuildingsAll = async function(req, res, next) {
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
            };

            db[req.body.subdomain].buildings.find({ _id: buildingM }, { alias: 1, _id: 1, timezone: 1, timezoneOffset: 1 }, async function(err, buildings) {

                if (err)
                    res.send(err);
                else {
                    let buildingObj = { name: req.body.subdomain, buildings: buildings, disabled: false, isDesk: false, isRoom: false, isSegment: false }
                    let desk = await db[obj.subdomain].sensorToBles.countDocuments({});
                    buildingObj.isDesk = desk > 0 ? true : false;
                    await multi.rpush(`getbuildingsAll-${req.body.subdomain}`, JSON.stringify(buildingObj));
                    multi.exec((err, res) => {
                        err ? console.error(err, "error") : client.expire(`getbuildingsAll-${req.body.subdomain}`, 600);
                    });
                    res.send(buildingObj);
                }
            });

        } else {
            res.status(400).send({ error: "no authToken matched " })
        }


    } catch (e) {
        console.log(e.message)
    }
}

exports.getbuildingsAllForHostcache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getbuildingsAllForHost-${obj.subdomain}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                res.send(JSON.parse(data));
            } else {
                console.log(err, "getbuildingsAllForHost")
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getbuildingsAllForHost = async function(req, res, next) {
    try {
        let multi = client.multi();
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, async(err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            } else {
                objC = Object.assign({}, decoded);
                const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
                let pass = result.password === objC.password;
                if (pass == true) {
                    let obj = req.body;
                    let Buildings = result.Buildings;
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
                    db[req.body.subdomain].buildings.find({ _id: buildingM }, { alias: 1, _id: 1, timezone: 1 }, async function(err, buildings) {
                        let buildingObj = { name: req.body.subdomain, buildings: buildings, disabled: false, isDesk: false, isRoom: false, isSegment: false };
                        if (err)
                            res.send(err)
                        else {
                            let desk = await db[obj.subdomain].sensorToBles.countDocuments({});
                            let rooms = await db[obj.subdomain].roomToBles.countDocuments({});
                            let segments = await db[obj.subdomain].segmentToBles.countDocuments({});
                            buildingObj.isDesk = desk > 0 ? true : false;
                            buildingObj.isRoom = rooms > 0 ? true : false;
                            buildingObj.isSegment = segments > 0 ? true : false;
                        }
                        await multi.rpush(`getbuildingsAllForHost-${obj.subdomain}`, JSON.stringify(buildingObj));
                        multi.exec((err, res) => {
                            err ? console.error(err, "error") : client.expire(`getbuildingsAllForHost-${obj.subdomain}`, 600);
                        });
                        res.send(buildingObj);
                    })
                } else {
                    res.status(400).send({ error: "no authToken matched " })
                }
            }
        });

    } catch (e) {
        console.log(e.message)
    }
}

exports.getBuildingsLocationscache = async(req, res, next) => {
    try {
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
            let obj = req.body;
            client.lrange(`getBuildingsLocations-${obj.subdomain}-${objC.username}`, 0, -1, (err, data) => {
                if (data.length > 0) {
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
        });
    } catch (e) {
        console.error(e);
        next();
    }
}


exports.getBuildingsLocations = async(req, res, next) => {

    try {
        let multi = client.multi();
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
        });
        let resultT = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1 });
        let pass = resultT.password === objC.password;
        if (pass == true) {
            let Buildings = resultT.Buildings;
            let obj = req.body;
            let builg = [],
                buildingM;
            if (Buildings.length > 0) {
                Buildings.map((b) => {
                    if (b.subdomain === obj.subdomain)
                        builg.push(b.id)
                })
                buildingM = { $in: builg };
            } else {
                buildingM = { $nin: builg };
            }

            let dataArray = [];
            let result = await db[obj.subdomain].buildings.find({ _id: buildingM }, {})
            if (result.length > 0) {
                result.forEach(ele => {
                    let struc = { name: ele.alias || ele.name, latitude: ele.latitude || 0, longitude: ele.longitude || 0, buildingId: ele._id }
                    dataArray.push(struc);
                    multi.rpush(`getBuildingsLocations-${obj.subdomain}-${objC.username}`, JSON.stringify(struc));
                })
            };
            multi.exec((err, res) => {
                err ? console.error(err, "error") : client.expire(`getBuildingsLocations-${obj.subdomain}-${objC.username}`, 600);
            })
            res.send(dataArray)


        } else {
            res.status(400).send({ error: "no authToken matched " })
        }




    } catch (e) {
        console.log(e.message)
    }





    // db[req.body.subdomain].buildings.find({ },{}, (err, buildings) => {
    //     if(err)
    //         res.send(err)
    //     else {
    //         var count = 0;
    //         var result = [];
    //         buildings.forEach( ele => {
    //             ++count
    //             result.push({ name:ele.alias, latitude: ele.latitude, longitude: ele.longitude })
    //             if(count == buildings.length){
    //                 res.send(result)
    //             }
    //         })
    //     }
    // })
}


exports.getblgsShippment = (req, res, next) => {
    db[req.body.subdomain].buildings.find({}, { _id: 1, alias: 1 }, (err, buildings) => {
        if (err)
            res.send(err)
        else {
            res.send({
                name: req.body.subdomain,
                buildings: buildings
            })
        }
    })
}

exports.getDateForHostcache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getDateForHost-${obj.subdomain}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                res.send(JSON.parse(data));
            } else {
                console.log(err, "getDateForHost")
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getDateForHost = async(req, res, next) => {
    try {
        let multi = client.multi();
        let obj = req.body;
        // console.log(obj)
        let endDate = await db[obj.subdomain].hostLogs.find({}, { lastUpdated: 1, _id: 0 }).sort({ lastUpdated: -1 }).limit(1);
        let startDate = await db[obj.subdomain].hostLogs.find({}, { lastUpdated: 1, _id: 0 }).sort({ lastUpdated: 1 }).limit(1);
        let returnData = { startDate: startDate[0].lastUpdated, endDate: endDate[0].lastUpdated };

        await multi.rpush(`getDateForHost-${obj.subdomain}`, JSON.stringify(returnData));
        multi.exec((err, res) => {
            err ? console.error(err, "error") : client.expire(`getDateForHost-${obj.subdomain}`, 600);
        });
        res.send(returnData);

    } catch (e) {
        console.log(e.message);
        res.send([])
    }
}

exports.getDateForSensorscache = async(req, res, next) => {
    try {
        let obj = req.body;
        client.lrange(`getDateForSensors-${obj.subdomain}`, 0, -1, (err, data) => {
            if (data.length > 0) {
                res.send(JSON.parse(data));
            } else {
                console.log(err, "getDateForSensors")
                next();
            }
        })
    } catch (e) {
        console.error(e);
        next();
    }
}

exports.getDateForSensors = async(req, res, next) => {
    try {
        let multi = client.multi();
        let obj = req.body;
        let endDate = await db[obj.subdomain].sensorHealthLogs.find({}, { time: 1, _id: 0 }).sort({ time: -1 }).limit(1);
        let startDate = await db[obj.subdomain].sensorHealthLogs.find({}, { time: 1, _id: 0 }).sort({ time: 1 }).limit(1);
        let returnData = { startDate: startDate[0].time, endDate: endDate[0].time }
        await multi.rpush(`getDateForSensors-${obj.subdomain}`, JSON.stringify(returnData));
        multi.exec((err, res) => {
            err ? console.error(err, "error") : client.expire(`getDateForSensors-${obj.subdomain}`, 600);
        });
        res.send(returnData);
    } catch (e) {
        console.log(e.message);
        res.send([])
    }
}
