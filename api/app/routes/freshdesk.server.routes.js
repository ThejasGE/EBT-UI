const freshdeskData = require("../controllers/freshdesk.server.controller.js");
module.exports = app => {
  app.route("/api/freshdesk/getFreshDesk").post(freshdeskData.getFreshDesk);
};
