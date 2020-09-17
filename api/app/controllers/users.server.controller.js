var mongoose = require('mongoose'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken');
var db = require('../../config/mongoose');
let Buildings = require('./building.server.controller');
let Dashboard = require('./dashboard.server.controller')
var tokenSecret = "superSecret";
var company = db["localhost"];



exports.createtoken = async(req, res, next) => {
    try {
        obj = req.body;
        // console.log(obj)
        let userData, counter = 0;
        if (obj.username) {
            if (typeof res.locals.user !== 'undefined') {
                userData = res.locals.user;
                var myToken = await jwt.sign({
                    username: userData.username,
                    password: userData.password,
                    isAdmin: userData.isAdmin,
                    Buildings: userData.isBuilding
                }, req.config.tokenSecret, { expiresIn: '1h' });
                typeof myToken !== 'undefined' ? res.send({ myToken }) : res.status(403);
            } else {
                console.log("Token created successfully");
                counter = 0;
                if (typeof obj.username !== 'undefined') {
                    let p = obj.password + 'noc';
                    var md5 = crypto.createHash('md5');
                    obj.password = md5.update(p).digest('hex');
                    const result = await db['localhost'].users.findOne({ username: obj.username, password: obj.password }, { _id: 0, Buildings: 1, isAdmin: 1 });
                    var myToken = await jwt.sign({
                        username: obj.username,
                        password: result.password,
                        isAdmin: result.isAdmin,
                        Buildings: result.Buildings
                    }, req.config.tokenSecret, { expiresIn: '120s' });
                    typeof myToken !== 'undefined' ? res.send({
                        success: true,
                        msg: 'Token created successfully ',
                        myToken
                    }) : res.status(403);
                }
            }
        } else {
            res.status(403)
            res.send({
                success: false,
                msg: 'Please provide valid username'
            });
        }

    } catch (e) {
        console.error(e);
        // res.status(500).status({ err: e.message })
    }

}


exports.createUser = async(req, res, next) => {
    try {
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, async(err, decoded) => {
            if (err) {
                res.status(403).send({ err, key: req.authToken, tokenSecret: req.config.tokenSecret });
            } else {
                objC = Object.assign({}, decoded);
                const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0 });
                let pass = result.password === objC.password;
                let obj = req.body;
                if (pass == true) {
                    // let obj = { fullName: 'dhamodar', email: `sumanth@adappt.com`, username: 'admin', password: 'adminpass', LastfailedattemptTime: null, isLocked: false, isActive: true, isAdmin: true, Buildings: ['5c346e012691774a8217590c'] };
                    let userr = new db['localhost'].users(obj);
                    let data = await userr.save();
                    res.send(data);
                } else {
                    res.status(401).send({ err: " no authorization" });
                }
            }
        });


    } catch (e) {
        res.status(400).send({ err: e.message })
    }
}


exports.authUser = async(req, res, next) => {
    try {
        let obj = req.body;
        // console.log("object is here", obj)
        let userNames = await db['localhost'].users.findOne({ email: obj.email, userame: obj.userName }, { username: 1, _id: 0, password: 1, email: 1 });
        // console.log("usernames", userNames)
        if (userNames.email == obj.email) {
            let pass = await userNames.comparepasswords(obj.password);
            if (pass == true) {
                let update = await db['localhost'].users.findOneAndUpdate({ username: obj.username }, { islastLogin: new Date() }, { new: true });
                if (typeof update.username !== 'undefined') {
                    let resultedUser = {
                        username: update.username,
                        name: update.fullName,
                        password: update.password,
                        isBuilding: update.Buildings
                    };
                    res.locals.user = resultedUser;
                    next();
                }
            } else {
                let update = await db['localhost'].users.findOneAndUpdate({ username: obj.username }, { LastfailedattemptTime: new Date() }, { new: true });
                res.send({ username: update.username, permission: pass })
            }
        }
    } catch (e) {
        res.status(403).send({ err: e.message, username: "no user registered", permission: false })
    }
}


exports.updateUser = async(req, res, next) => {
    try {
        let objC;
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
        });
        if (typeof objC === 'object' && objC !== null) {
            const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0 });
            let pass = result.password === objC.password;
            if (pass == true) {
                let rObj = req.body;
                if (rObj.password != '') {
                    let p = rObj.password + 'noc';
                    var md5 = crypto.createHash('md5');
                    rObj.password = md5.update(p).digest('hex');
                };
                if (rObj.password == '') {
                    let userData = await db['localhost'].users.findOne({ email: rObj.email }, { password: 1, _id: 0 });
                    rObj.password = userData.password;
                }
                let users = await db['localhost'].users.findByIdAndUpdate(rObj.id, { Buildings: rObj.Buildings, password: rObj.password, isLocked: rObj.isLocked, isActive: rObj.isActive, isAdmin: rObj.isAdmin }, { new: true });
                console.log(users, "users");
                res.send(users);

            } else {
                res.status(401).send({ err: " no authorization" });
            }
        }


    } catch (e) {
        res.status(400).send({ err: e.message });
    }


}

exports.getUsers = async(req, res, next) => {
    try {
        let objC;
        // console.log(req.authToken, "authtoken.................................................")
        jwt.verify(req.authToken, req.config.tokenSecret, (err, decoded) => {
            if (err) {
                res.status(403).send({ err });
            }
            objC = Object.assign({}, decoded);
        });
        if (typeof objC === 'object' && objC !== null) {
            const result = await db['localhost'].users.findOne({ username: objC.username }, { password: 1, _id: 0, Buildings: 1, isAdmin: 1, isActive: 1 });
            let pass = result.password === objC.password;

            if (pass == true && result.isAdmin == true && result.isActive == true) {
                let users = await db['localhost'].users.find({}, { password: 0 });
                res.send(await processUsersData(users))
            } else if (pass == true && result.isAdmin == false && result.isActive == true) {
                let users = await db['localhost'].users.find({ isAdmin: false }, { password: 0 });
                res.send(await processUsersData(users))
            } else {
                res.status(401).send({ error: "no authToken matched " })
            }
        }
    } catch (e) {
        res.status = 400;
        res.send({ err: e.message })
    }
}

async function processUsersData(users) {
    resArr = [];
    for await (let user of users) {
        let resultData = {};
        resultData.id = user.id;
        resultData.fullName = user.fullName;
        resultData.email = user.email;
        resultData.username = user.username;
        resultData.LastfailedattemptTime = user.LastfailedattemptTime;
        resultData.isLocked = user.isLocked;
        resultData.password = '';
        resultData.isActive = user.isActive;
        resultData.isAdmin = user.isAdmin;
        resultData.islastLogin = user.islastLogin;
        var bArr = [];
        if (user.Buildings.length > 0) {
            for await (let build of user.Buildings) {
                bArr.push(build.id);
            };
            resultData.Buildings = bArr;
        } else {
            resultData.Buildings = bArr;
        }
        resArr.push(resultData)
    }
    console.log(resArr)
    return resArr
}