const dashBoardData = require('../controllers/dashboard.server.controller');
module.exports = function(app) {
    app.route('/api/dashboard/sendSensorConfig').post(dashBoardData.sendSensorConfig);
    // app.route('/api/dashboard/getSensorConfig').post(dashBoardData.getSensorConfig);
    app.route('/api/dashboard/getSensorConfigTable').post(dashBoardData.getSensorConfigTable);
    app.route('/api/dashboard/getHostCount').post(dashBoardData.getHostCount);
    app.route('/api/dashboard/getLocalSiteConfig').post(dashBoardData.getLocalSiteConfig);
    app.route('/api/dashboard/getLocalSiteConfigSiteWise').post(dashBoardData.getLocalSiteConfigSiteWise);
    app.route('/api/dashboard/getlocalDbCount').post(dashBoardData.getlocalDbCount);
    app.route('/api/dashboard/getDomainList').post(dashBoardData.getDomainList);
}