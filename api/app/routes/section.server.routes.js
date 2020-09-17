var section = require('../controllers/section.server.controller');

module.exports = function(app) {
    app.route('/api/rooms').post(section.getRoomConfig);
    app.route('/api/roomOccupancyStatus').post(section.getroomOccupancyStatus);
    app.route('/api/roomUsage').post(section.getroomUsage);
    app.route('/api/availableRooms').post(section.availableRooms);
}