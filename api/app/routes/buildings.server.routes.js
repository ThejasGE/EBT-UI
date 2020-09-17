const buildings = require('../controllers/building.server.controller');

module.exports = function(app) {

    app.route('/api/buildings/all').post(buildings.getbuildings);
    app.route('/api/buildings/getbarcFewbuildings').post(buildings.getbarcFewbuildings);
    app.route('/api/buildings/getbuildingsAll').post(buildings.getbuildingsAll);
    app.route('/api/buildings/getbuildingsAllForHost').post(buildings.getbuildingsAllForHost);
    app.route('/api/buildings/getblgsShippment').post(buildings.getblgsShippment);
    app.route('/api/buildings/getBuildingsLocations').post(buildings.getBuildingsLocations);
    app.route('/api/buildings/getDateForHost').post(buildings.getDateForHost);
    app.route('/api/buildings/getDateForSensors').post(buildings.getDateForSensors);
}