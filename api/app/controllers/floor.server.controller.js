var db = require('../../config/mongoose'),
    jwt = require('jsonwebtoken');
var _ = require('lodash');
exports.getfloors = function(req, res, next) {
    // console.log(db[req.body.subdomain]);
    db[req.body.subdomain].buildings.findById(req.body.buildingId, function(err, building) {
        db[req.body.subdomain].floorses.find({
            _id: {
                $in: building.floors
            }
        }, function(err, floors) {

            if (err)
                res.send(err)
            else {
                res.send({
                    success: true,
                    data: floors
                });
            }
        });
    })
}


exports.getfloor = function(req, res, next) {
    // console.log(db[req.body.subdomain]);
    db[req.body.subdomain].floorses.findById(req.params.fid, function(err, floor) {

        if (err)
            res.send(err)
        else {
            res.send({
                success: true,
                data: floor
            });
        }
    });
}

exports.wholeData = async(req, res, next) => {
    try {
        let obj = req.body;

        if (obj.bName === undefined) {
            obj.bKey = false;
        } else {
            obj.bKey = true;
        }
        if (obj.fName === undefined) {
            obj.fKey = false;
        } else {
            obj.fKey = true;
        }
        if (obj.sName === undefined) {
            obj.sKey = false;
        } else {
            obj.sKey = true;
        };
        let occupancyData = [],
            lightingData = [],
            CeilingData = [],
            novaData = [];

        occupancyData = await getoccupancy(obj);
        novaData = await getNovadata(obj);
        lightingData = await getlighting(obj);
        CeilingData = await getCeilingOccupancy(obj);
        let occupancyresult = [];
        for await (let data of occupancyData) {
            let struc = {};
            struc.BuildingName = data.BuildingName;
            struc.FloorName = data.FloorName;
            struc.sectionName = data.sectionName;
            struc.Occupancy = {};
            struc.Occupancy.Active = data.Active;
            struc.Occupancy.unhealthyble = data.unhealthble;
            struc.Occupancy.inActive = data.inActive;
            struc.Occupancy.total = data.total;
            occupancyresult.push(struc);
        };
        let novaResult = [];
        for await (let data of novaData) {
            let struc = {};
            struc.BuildingName = data.BuildingName;
            struc.FloorName = data.FloorName;
            struc.sectionName = data.sectionName;
            struc.nova = {};
            struc.nova.Active = data.Active;
            struc.nova.unhealthyble = data.unhealthble;
            struc.nova.inActive = data.inActive;
            struc.nova.total = data.total;
            novaResult.push(struc);
        };

        let lightResult = [];
        for await (let data of lightingData) {
            let struc = {};
            struc.BuildingName = data.BuildingName;
            struc.FloorName = data.FloorName;
            struc.sectionName = data.sectionName;
            struc.lighting = {};
            struc.lighting.Active = data.Active;
            struc.lighting.unhealthyble = data.unhealthble;
            struc.lighting.inActive = data.inActive;
            struc.lighting.total = data.total;
            lightResult.push(struc);
        };
        let CeilingResult = [];
        for await (let data of CeilingData) {
            let struc = {};
            struc.BuildingName = data.BuildingName;
            struc.FloorName = data.FloorName;
            struc.sectionName = data.sectionName;
            struc.Ceiling = {};
            struc.Ceiling.Active = data.Active;
            struc.Ceiling.unhealthyble = data.unhealthble;
            struc.Ceiling.inActive = data.inActive;
            struc.Ceiling.total = data.total;
            CeilingResult.push(struc);
        };
        let finalResult = [];
        if (occupancyresult.length > 0 && finalResult.length == 0) {
            finalResult = [...occupancyresult];
        }
        if (novaResult.length > 0 && finalResult.length == 0) {
            finalResult = [...novaResult];
        }
        if (CeilingResult.length > 0 && finalResult.length == 0) {
            finalResult = [...CeilingResult];
        }
        if (lightResult.length > 0 && finalResult.length == 0) {
            finalResult = [...lightResult];
        };
        for await (let fr of finalResult) {
            for await (let nr of novaResult) {
                if (fr.BuildingName == nr.BuildingName && fr.FloorName == nr.FloorName && fr.sectionName == nr.sectionName) {
                    fr.nova = nr.nova;
                } else if (fr.BuildingName == nr.BuildingName && fr.FloorName == nr.FloorName) {
                    fr.nova = nr.nova
                }
            }
            for await (let or of occupancyresult) {
                if (fr.BuildingName == or.BuildingName && fr.FloorName == or.FloorName && fr.sectionName == or.sectionName) {
                    fr.Occupancy = or.Occupancy;
                } else if (fr.BuildingName == or.BuildingName && fr.FloorName == or.FloorName) {
                    fr.Occupancy = or.Occupancy;
                }
            }
            // console.log(fr)
            for await (let lr of lightResult) {
                if (fr.BuildingName == lr.BuildingName && fr.FloorName == lr.FloorName && fr.sectionName == lr.sectionName) {
                    fr.lighting = lr.lighting;
                } else if (fr.BuildingName == lr.BuildingName && fr.FloorName == lr.FloorName) {
                    fr.lighting = lr.lighting;
                }
            }
            for await (let cr of CeilingResult) {
                if (fr.BuildingName == cr.BuildingName && fr.FloorName == cr.FloorName && fr.sectionName == cr.sectionName) {
                    fr.Ceiling = cr.Ceiling;
                } else if (fr.BuildingName == cr.BuildingName && fr.FloorName == cr.FloorName) {
                    fr.Ceiling = cr.Ceiling;
                }
            }

        }
        console.log(" Response Got from ", obj.subdomain);
        res.send(finalResult)
    } catch (e) {
        console.log(e.message);
        res.status(400).send({ error: e.message })
    }

};
let building_match = { $match: { name: '' } };
let floor_match = { $match: { "floorData.name": '' } };
let sectionm_name = { $match: { "sections_docs.name": '' } };
let sectionz_name = { $match: { "zones_docs.name": '' } };
let floors_docs = { $lookup: { from: "floors", localField: "floors", foreignField: "_id", as: "floorData" } };
let floors_unwind = { $unwind: "$floorData" };
let sections_docs = { $lookup: { from: "sections", localField: "floorData.sections", foreignField: "_id", as: "sections_docs" } };
let sections_unwind = { $unwind: "$sections_docs" };
let section_matcF = { $match: { "sections_docs.isRoom": false } };
let section_matchT = { $match: { "sections_docs.isRoom": true } };
let secSeats_unwind = { $unwind: "$sections_docs.seats" };
let senTobles_docs = { $lookup: { from: "sensortobles", localField: "sections_docs.seats", foreignField: "seatId", as: "sensorbleData" } };
let senTobles_unwind = { $unwind: "$sensorbleData" };
let roomtobles_docs = { $lookup: { from: "roomtobles", localField: "sections_docs._id", foreignField: "roomId", as: "roomtoblesData" } };
let roomtobles_unwind = { $unwind: "$roomtoblesData" };
let bles_docs = { $lookup: { from: "bles", localField: "sensorbleData.bleId", foreignField: "_id", as: "blesDocs" } };
let bles_unwind = { $unwind: "$blesDocs" };
let blesLightType = { $match: { "blesDocs.isLAD": true } };
let bleLink_docs = { $lookup: { from: "lighttobles", localField: "blesDocs._id", foreignField: "bleId", as: "ligtoble_docs" } };
let bleLink_docs_unwind = { $unwind: "$ligtoble_docs" };
let Zones_docs = { $lookup: { from: "zones", localField: "ligtoble_docs.lightId", foreignField: "lights", as: "zones_docs" } };
let Zones_docs_unwind = { $unwind: "$zones_docs" };
let Zones_match = { $match: { "zones_docs.name": '' } };
let occup_group = {
    $group: {
        _id: { b: "$_id", f: "$floorData._id", sec: "$sections_docs._id" },
        BuildingName: { $first: "$name" },
        FloorName: { $first: "$floorData.name" },
        sectionName: { $first: "$sections_docs.name" },
        Active: { $sum: { $cond: ["$sensorbleData.status", 1, 0] } },
        unhealthble: { $push: { $cond: [{ $eq: ["$sensorbleData.status", false] }, "$blesDocs.address", null] } },
        healthyble: { $push: { $cond: [{ $eq: ["$sensorbleData.status", true] }, "$blesDocs.address", null] } }
    }
};
let lightGroup = {
    $group: {
        _id: { f: "$floorData._id", z: "$zones_docs._id" },
        floorName: { $first: "$floorData.name" },
        BuildingName: { $first: "$name" },
        FloorName: { $first: "$floorData.name" },
        zoneName: { $first: "$zones_docs.name" },
        Active: { $sum: { $cond: ["$ligtoble_docs.status", 1, 0] } },
        unhealthble: { $push: { $cond: [{ $eq: ["$ligtoble_docs.status", false] }, "$blesDocs.address", null] } },
        healthyble: { $push: { $cond: [{ $eq: ["$ligtoble_docs.status", true] }, "$blesDocs.address", null] } },
    }
};
let occup_project = {
    $project: {
        _id: 1,
        BuildingName: "$BuildingName",
        FloorName: "$FloorName",
        sectionName: "$sectionName",
        Active: "$Active",
        unhealthble: "$unhealthble",
        healthyble: "$healthyble"
    }
};


async function getoccupancy(obj) {
    try {
        // let result = [];
        building_match.$match.name = obj.bName;
        occup_project.$project.sectionName = "$sectionName";
        occup_group.$group.Active.$sum.$cond = ["$sensorbleData.status", 1, 0];
        bles_docs.$lookup.localField = "sensorbleData.bleId";
        bles_docs.$lookup.foreignField = "_id";
        occup_group.$group.unhealthble.$push.$cond = [{ $eq: ["$sensorbleData.status", false] }, "$blesDocs.address", null];
        occup_group.$group.healthyble.$push.$cond = [{ $eq: ["$sensorbleData.status", true] }, "$blesDocs.address", null];
        if (obj.fKey == true && obj.sKey == true) {
            floor_match.$match = { "floorData.name": obj.fName };
            sectionm_name.$match = { "sections_docs.name": obj.sName };
            result = await db[obj.subdomain].buildings.aggregate([building_match,
                floors_docs, floors_unwind, floor_match, sections_docs, sections_unwind, section_matcF, sectionm_name, secSeats_unwind, senTobles_docs, senTobles_unwind, bles_docs, bles_unwind,
                occup_group, occup_project
            ]).allowDiskUse(true);
        } else {
            result = await db[obj.subdomain].buildings.aggregate([building_match,
                floors_docs, floors_unwind, sections_docs, sections_unwind, secSeats_unwind, senTobles_docs, senTobles_unwind, bles_docs, bles_unwind,
                occup_group, occup_project
            ]).allowDiskUse(true);
        }
        console.log(result)
        result = await getArrayFiltering(result);
        // console.log("getoccupancy", result, sectionm_name);
        // sectionm_name.$match = {};
        return result;
    } catch (e) {
        console.log(e.message)
    }
}
async function getNovadata(obj) {
    try {
        // let result = [];
        building_match.$match.name = obj.bName;
        floor_match.$match = { "floorData.name": obj.fName };
        sectionm_name.$match = { "sections_docs.name": obj.sName };
        bles_docs.$lookup.localField = "roomtoblesData.bleId";
        occup_group.$group.Active.$sum.$cond = ["$roomtoblesData.status", 1, 0];
        occup_group.$group.unhealthble.$push.$cond = [{ $eq: ["$roomtoblesData.status", false] }, "$blesDocs.address", null];
        occup_group.$group.healthyble.$push.$cond = [{ $eq: ["$roomtoblesData.status", true] }, "$blesDocs.address", null];

        if (obj.fKey == true && obj.sKey == true) {
            result = await db[obj.subdomain].buildings.aggregate([building_match, floors_docs, floors_unwind, floor_match,
                sections_docs, sections_unwind, sectionm_name, section_matchT, roomtobles_docs, roomtobles_unwind, bles_docs,
                bles_unwind, occup_group, occup_project
            ]).allowDiskUse(true);
        } else {
            result = await db[obj.subdomain].buildings.aggregate([building_match, floors_docs, floors_unwind,
                sections_docs, sections_unwind, section_matchT, roomtobles_docs, roomtobles_unwind, bles_docs,
                bles_unwind, occup_group, occup_project
            ]).allowDiskUse(true);
        }
        result = await getArrayFiltering(result);
        // console.log("getNovadata", result, sectionm_name);
        // sectionm_name.$match = {};
        return result;
    } catch (e) {
        console.log(e.message);
        return result = [];
    }
}
async function getArrayFiltering(result) {
    if (result.length > 0) {
        for await (let res of result) {
            res.unhealthble = _.filter(res.unhealthble, function(a) { return !_.isNull(a) });
            res.healthyble = _.filter(res.healthyble, function(a) { return !_.isNull(a) });
            res.inActive = res.unhealthble.length;
            res.Active = res.healthyble.length;
            res.total = res.healthyble.length + res.unhealthble.length;
        }
    }
    return result;
}
async function getlighting(obj) {
    try {
        let result = [];
        building_match.$match.name = obj.bName;
        floor_match.$match = { "floorData.name": obj.fName };
        bles_docs.$lookup.localField = "floors";
        bles_docs.$lookup.foreignField = "floorId";
        occup_project.$project.sectionName = "$zoneName";
        Zones_match = { $match: { "zones_docs.name": obj.sName } };
        if (obj.fKey == true && obj.sKey == true) {
            result = await db[obj.subdomain].buildings.aggregate([
                building_match,
                floors_docs, floors_unwind, floor_match,
                bles_docs, bles_unwind,
                blesLightType,
                bleLink_docs, bleLink_docs_unwind,
                Zones_docs, Zones_docs_unwind, Zones_match,
                lightGroup,
                occup_project
            ]).allowDiskUse(true);

        } else {
            result = await db[obj.subdomain].buildings.aggregate([
                building_match,
                floors_docs, floors_unwind,
                bles_docs, bles_unwind,
                blesLightType,
                bleLink_docs, bleLink_docs_unwind,
                Zones_docs, Zones_docs_unwind,
                lightGroup,
                occup_project
            ]).allowDiskUse(true);
        }
        result = await getArrayFiltering(result);
        console.log("getlighting")
        return result;
    } catch (e) {
        console.log(e.message);
        return result = [];
    }
}


async function getCeilingOccupancy(obj) {
    try {
        let result = [];
        building_match.$match.name = obj.bName;
        floor_match.$match = { "floorData.name": obj.fName };
        // sectionm_name.$match = { "zones_docs.name": obj.sName };
        Zones_match = { $match: { "zones_docs.name": obj.sName } };
        bles_docs.$lookup.localField = "floors";
        bles_docs.$lookup.foreignField = "floorId";
        blesLightType.$match = { "blesDocs.isCOS": true };
        bleLink_docs.$lookup.from = "lightsensortobles";
        bleLink_docs.$lookup.as = "ligtsenble_docs";
        bleLink_docs_unwind.$unwind = "$ligtsenble_docs";
        Zones_docs.$lookup.localField = "ligtsenble_docs.lights";
        lightGroup.$group.Active.$sum.$cond = ["$ligtsenble_docs.status", 1, 0];
        lightGroup.$group.unhealthble.$push.$cond = [{ $eq: ["$ligtsenble_docs.status", false] }, "$blesDocs.address", null];
        lightGroup.$group.healthyble.$push.$cond = [{ $eq: ["$ligtsenble_docs.status", true] }, "$blesDocs.address", null];
        occup_project.$project.sectionName = "$zoneName";


        if (obj.fKey == true && obj.sKey == true) {
            result = await db[obj.subdomain].buildings.aggregate([building_match, floors_docs, floors_unwind, floor_match, bles_docs, bles_unwind,
                blesLightType, bleLink_docs, bleLink_docs_unwind, Zones_docs, Zones_docs_unwind, Zones_match, lightGroup, occup_project
            ]).allowDiskUse(true);
        } else {
            result = await db[obj.subdomain].buildings.aggregate([building_match, floors_docs, floors_unwind, bles_docs, bles_unwind,
                blesLightType, bleLink_docs, bleLink_docs_unwind, Zones_docs, Zones_docs_unwind, lightGroup, occup_project
            ]).allowDiskUse(true);
        }
        result = await getArrayFiltering(result);
        console.log("getCeilingOccupancy")
        return result;
    } catch (e) {
        console.log(e.message);
        return result = [];
    }
}