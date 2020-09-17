var db = require('../../config/mongoose'),
    jwt = require('jsonwebtoken');
var tokenSecret = "superSecret";

const redis = require('redis');
const REDIS_PORT = process.env.PORT || 6379;
const client = redis.createClient({ port: REDIS_PORT });
client.on("error", function(err) {
    console.log("Error " + err);
})
var company = db["localhost"];
// db[data.subdomain].buildings



exports.getAllCustomers = async function(req, res, next) {
    // var data = req.query;
    // db[data.subdomain].buildings
    // console.log("I have been hitted")
    company.customers.find({}, function(err, customers) {
        if (err)
            res.send(err)
        else {
            res.send(customers);
            // console.log(customers, "i am the output")

        }
    })
}



exports.getCustomer = function(req, res, next) {
    var cid = req.params.cid;

    company.customers.findById(req.params.cid, function(err, customer) {
        console.log(req.params.cid)
        if (err)
            res.send(err)
        else {
            res.send({
                customer: customer
            });
        }
    });
}


// db.getCollection('customers').aggregate([  
//     {$group:{_id:"$_id.name",cust:{$sum:1}}},
//      {$group:{_id:null,totalcustomers:{$sum:"$cust"}}},
//    {$project:{_id:0,totalcustomers:1}}
//    ])

exports.getCustomersStatus = function(req, res, next) {
    company.customers.aggregate([
        { $match: { status: true } }
        // { $group: { _id: "$_id.name", cust: { $sum: 1 } } },
        // { $group: { _id: null, Active: { $sum: "$cust" } } },
        // { $project: { _id: 0, active: 1 } }
    ], function(err, data) {
        if (err)
            res.send(err)
        else {
            res.send(data);
            // console.log(data, "i am the output")

        }

    });
}

exports.selectedServices = function(req, res, next) {
    var cid = req.params.cid
        // console.log(req.params.cid)
        // console.log(cid, "Request params here..................")
    company.customers.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(cid) } },
        {
            $project: {
                _id: 0,
                name: 1,
                "hasOccupancy": 1,
                "hasLMS": 1,
                "hasOpenArea": 1,
                "hasCrbs": 1,
                "hasHotdesk": 1,
                "hasParking": 1,
                "hasAllocation": 1,
            }
        }
    ], function(err, data) {
        if (err)
            res.send(err)
        else {
            res.send(data);
            // console.log(data, "i am the output")
        }

    });
}


//     db.getCollection('customers').findOneAndUpdate({_id:ObjectId("5ec512ee3d9160e4f89362e2")},
//     {"$set":{"status":true}}
// )
// ({ _id: req.params.id },{"$set":{"active":false}})

exports.updateServices = async function(req, res, next) {
    var obj = req.body;
    // console.log(obj, "object")
    company.customers.findOneAndUpdate({ _id: mongoose.Types.ObjectId(obj._id) }, { "$set": { "hasLMS": obj.services.hasLMS, "hasOccupancy": obj.services.hasOccupancy, "hasAllocation": obj.services.hasAllocation, "hasCrbs": obj.services.hasCrbs, "hasOpenArea": obj.services.hasOpenArea, "hasHotdesk": obj.services.hasHotdesk, "hasParking": obj.services.hasParking } }, { upsert: true, new: true }, function(err, data) {
        if (err)
            console.log(err)
        else {
            res.send(data)
                // console.log(data, "Updated successfully");

        }
    })
}


exports.deleteCustomer = async function(req, res, next) {
    var obj = req.body;
    console.log(obj, "object")
    company.customers.remove({ _id: mongoose.Types.ObjectId(obj._id) }, function(err, data) {
        if (err) {
            console.log(err);
            res.send('Failed to Remove');
        } else {
            res.send(data)
                // console.log(data, "removed successfully");
        }
    })
}


exports.createCustomer = async(req, res, err) => {
    try {
        let obj = req.body;
        let customerr = new db['localhost'].customers(obj);
        let data = await customerr.save();
        res.send(data);

    } catch (e) {
        console.error(e)
        res.status(400).send({ err: e.message })
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
        // console.log(req.authToken, "authtoken.................................................")
        jwt.verify(req.authToken, req.config.tokenSecret, async(err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            obj = Object.assign({}, decoded);
            const result = await company.users.findOne({ username: obj.username, password: obj.password }, { _id: 0, Buildings: 1, isAdmin: 1, isActive: 1 });
            console.log(result)
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