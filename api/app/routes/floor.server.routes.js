const floors = require('../controllers/floor.server.controller');

module.exports = function(app) {
    app.route('/api/building/floor/').post(floors.getfloors);
    app.route('/api/floor:fid').post(floors.getfloor);
    app.route('/api/wholeData').post(floors.wholeData)

}