const deskDatas = require('../controllers/deskData.server.controller');
module.exports = function(app) {
    app.route('/api/desksensor/deskData').post(deskDatas.getDeskDatas);
    app.route('/api/desksensor/getDeskCount').post(deskDatas.getDeskCount);
}