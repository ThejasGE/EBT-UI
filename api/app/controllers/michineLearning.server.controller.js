var db = require("../../config/mongoose");

var moment = require("moment-timezone");

exports.firstFunction = async (req, res, next) => {
  res.setTimeout(1000 * 60);
  let obj = req.body;
  console.log(obj);
  let data = [],
    bles = [];
  try {
    building = await db[obj.subdomain].buildings.find(
      { alias: "Adobe Tokyo" },
      { _id: 0, floors: 1 }
    );
    bles = await db[obj.subdomain].roomtobles.find(
      { floorId: { $in: building.floors } },
      { bleId: 1, _id: 0 }
    );
    data = await db[obj.subdomain].sensorDatas.aggregate([
      { $match: { sensorId: { $in: bles.bleId } } },
      { $sort: { time: 1 } },
      {
        $group: {
          _id: {
            $subtract: [
              { $subtract: ["$time", new Date("1970-01-01")] },
              {
                $mod: [
                  { $subtract: ["$time", new Date("1970-01-01")] },
                  1000 * 60
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log("Data Served");
  } catch (e) {
    console.log(e.message);
  }
  res.send(data);
};

exports.excelFunc = async (req, res, next) => {
  try {
    obj = req.body;let excelData = []
    excelData = await db[obj.subdomain].excelAggregations.aggregate([
      // { $match: { day:"12-08-2019" } },
      {$group:{ _id:{ day: "$day",seatId: "$seatId"}, total:{ $sum:1}, uid:{$push:"$_id"} }},
     { $project: { day: "$_id.day",seat:"$_id.seatId", total:"$total", uid:1 }},
    { $match: { total: { $gt: 1 }}} 
    ]).allowDiskUse(true);
    let i =0;
    if(excelData.length > 0){
      for ( let ex of excelData) {
        if( ex.uid.length > 0){
          let sliceArray = ex.uid.slice(1, ex.uid.length);
          console.log(sliceArray,++i)
          removeExcel = await db[obj.subdomain].excelAggregations.deleteOne({ _id: { $in:sliceArray} }, (err) => {
            if(!err){
              console.log(err)
            } else {
              console.log( sliceArray, "Deleted ")
            }
          })
        }
      }
    }
    res.send(excelData)
  } catch (e) {
    console.log(e.message);
    res.send([])
  }
  

}
