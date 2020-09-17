const mlData = require("../controllers/michineLearning.server.controller.js");
module.exports = app => {
  app.route("/api/michineLearn/firstfunction").post(mlData.firstFunction);
  app.route("/api/michineLearn/excelDelete").post(mlData.excelFunc);
  
};
