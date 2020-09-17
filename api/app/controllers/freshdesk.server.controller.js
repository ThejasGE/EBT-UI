const Freshdesk = require("freshdesk-api");
const freshdesk = new Freshdesk(
  "https://supportadappt.freshdesk.com",
  "6CeDbIKkNIyjWBOPwQWO"
);
var db = require("../../config/mongoose");

exports.getFreshDesk = (req, res, next) => {
  const obj = req.body;
  console.log(obj);
  try {
    freshdesk.listAllCompanyFields((err, data, extra) => {
      if (!err) res.send(data);
      else res.send(err);
    });
  } catch (e) {
    console.log(e.message);
  }
};
