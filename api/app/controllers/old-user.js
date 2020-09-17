var mongoose = require('mongoose'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken');
var db = require('../../config/mongoose');
let Buildings = require('./building.server.controller');
let Dashboard = require('./dashboard.server.controller')


exports.createtoken = async(req, res, next) => {
    try {
        obj = req.body;
        let userData, counter = 0;
        if (obj.username) {
            if (typeof res.locals.user !== 'undefined') {
                userData = res.locals.user;
                if (userData.isAdmin == true) {
                    counter = 0;
                    for (let subdomain of global.domainData) {
                        var myToken = await jwt.sign({
                            username: userData.username
                        }, req.config.tokenSecret, { expiresIn: '1h' });
                        await db[subdomain]['authtokenses'].find({}, function(err, data) {
                            var authtokens = new db[subdomain].authtokenses({
                                token: myToken,
                                domain: subdomain,
                                username: userData.username
                            });
                            authtokens.save(function(err, data) {
                                if (err) {
                                    console.error(err)
                                    res.send(userData);
                                } else {
                                    console.log(data, subdomain, "subdomain");
                                    if (global.domainData.length == ++counter) {
                                        // userData.token = myToken;
                                        res.send(userData);
                                    }
                                }
                            })
                        })
                    }
                } else {
                    counter = 0;
                    for (let bu of userData.isBuilding) {
                        var myToken = await jwt.sign({
                            username: userData.username
                        }, req.config.tokenSecret, { expiresIn: '600s' });
                        console.log(bu.subdomain, myToken);
                        await db[bu.subdomain]['authtokenses'].find({}, function(err, data) {
                            var authtokens = new db[bu.subdomain].authtokenses({
                                token: myToken,
                                domain: bu.subdomain,
                                username: userData.username
                            });
                            authtokens.save(function(err, data) {
                                if (err) {
                                    res.send(userData);
                                } else {
                                    if (userData.isBuilding.length == ++counter) {
                                        res.send(userData);
                                    }
                                }
                            })
                        })
                    }
                }
            } else {
                console.log("token");
                counter = 0;
                const result = await db['localhost'].users.findOne({ username: obj.username }, { _id: 0, Buildings: 1, isAdmin: 1 });
                if (result.isAdmin == true) {
                    let tokenArray = []
                    for (let subdomain of global.domainData) {
                        var myToken = await jwt.sign({
                            username: obj.username
                        }, req.config.tokenSecret, { expiresIn: '120s' });
                        await db[subdomain]['authtokenses'].find({}, function(err, data) {
                            var authtokens = new db[subdomain].authtokenses({
                                token: myToken,
                                domain: subdomain,
                                username: obj.username
                            });
                            authtokens.save(function(err, data) {
                                if (err) {
                                    console.error(err)
                                    res.status(403)
                                } else {
                                    tokenArray.push(data);
                                    console.log(data, subdomain, "subdomain")
                                    if (global.domainData.length == ++counter) {
                                        res.send({
                                            success: true,
                                            msg: 'Token created successfully ',
                                            tokenArray: tokenArray
                                        });
                                    }
                                }
                            })
                        })
                    }
                } else {
                    if (typeof result.Buildings !== 'undefined') {
                        let tokenArray = []
                        for (let bu of result.Buildings) {
                            var myToken = await jwt.sign({
                                username: obj.username
                            }, req.config.tokenSecret, { expiresIn: '120s' });
                            console.log(bu.subdomain, myToken);
                            await db[bu.subdomain]['authtokenses'].find({}, function(err, data) {
                                var authtokens = new db[bu.subdomain].authtokenses({
                                    token: myToken,
                                    domain: bu.subdomain,
                                    username: obj.username
                                });
                                authtokens.save(function(err, data) {
                                    if (err) {
                                        console.error(err)
                                        res.status(403)
                                    } else {
                                        tokenArray.push(data);
                                        if (result.Buildings.length == ++counter) {
                                            res.send({
                                                success: true,
                                                msg: 'Token created successfully ',
                                                tokenArray
                                            });
                                        }
                                    }
                                })
                            })
                        }
                    } else {
                        res.status(403)
                    }
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
        var objT = await req.headers.authorization;
        objT = JSON.parse(objT);
        const result = await db['localhost'].users.findOne({ username: objT.user }, { password: 1, _id: 0 });
        let admin = objT.admin == 'true' ? true : false;
        let pass = result.password === objT.authToken;
        let obj = req.body;
        if (pass == true) {
            // let obj = { fullName: 'dhamodar', email: `dhamodar.p@adappt.com`, username: 'admin', password: 'adminpass', LastfailedattemptTime: null, isLocked: false, isActive: true, isAdmin: true, Buildings: ['5c346e012691774a8217590c'] };
            let userr = new db['localhost'].users(obj);
            let data = await userr.save();
            res.send(data);
        } else {
            res.status(401).send({ err: " no authorization" });
        }


    } catch (e) {
        res.status(400).send({ err: e.message })
    }
}


exports.authUser = async(req, res, next) => {
    try {
        let obj = req.body;
        let userNames = await db['localhost'].users.findOne({ email: obj.email, username: obj.username }, { username: 1, _id: 0, password: 1, email: 1 });
        if (userNames.email == obj.email) {
            let pass = await userNames.comparepasswords(obj.password);
            if (pass == true) {
                let update = await db['localhost'].users.findOneAndUpdate({ username: obj.username }, { islastLogin: new Date() }, { new: true });
                if (typeof update.username !== 'undefined') {
                    let resultedUser = {
                        username: update.username,
                        name: update.fullName,
                        permission: pass,
                        auth_token: update.password,
                        isAdmin: update.isAdmin,
                        isActive: update.isActive,
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
        var obj = await req.headers.authorization;
        obj = JSON.parse(obj);
        if (typeof obj === 'object' && obj !== null) {
            const result = await db['localhost'].users.findOne({ username: obj.user }, { password: 1, _id: 0 });
            let pass = result.password === obj.authToken;
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
        var obj = await req.headers.authorization;
        obj = JSON.parse(obj);
        if (typeof obj === 'object' && obj !== null) {
            const result = await db['localhost'].users.findOne({ username: obj.user }, { password: 1, _id: 0, Buildings: 1, isAdmin: 1, isActive: 1 });
            let pass = result.password === obj.authToken;
            let admin = obj.admin == 'true' ? result.isAdmin : false;
            let active = obj.active == 'true' ? result.isActive : false;
            if (pass == true && admin == true && active == true) {
                let users = await db['localhost'].users.find({}, { password: 0 });
                res.send(await processUsersData(users))
            } else if (pass == true && admin == false && active == true) {
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