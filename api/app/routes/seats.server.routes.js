var seats = require('../controllers/seats.server.controller');

module.exports = function(app) {
    app.route('/api/seats/config').post(seats.getseatConfig);
    app.route('/api/floor/occupancy').post(seats.getoccupancy);
    app.route('/api/floor/occupancyCount').post(seats.getoccupancyCount);
    app.route('/api/occupancyAggregation').post(seats.getoccupancyAggregation);
    app.route('/api/floor/occupancyPattern').post(seats.getoccupancyPattern);
    app.route('/api/availableSeats').post(seats.getavailableSeats);


}