let sockets = require('../controllers/sockets.server.controllers');
var db = require('../../config/mongoose');
module.exports = function(app, io) {
    app.route('/api/dashboardSockets').post(async(req, res, next) => {
        try {

            await db[req.body.subdomain].sensorToBles.watch().on('change', change => {
                console.log(change)
            })

            io.on('connection', (data) => {
                console.log('A socket is connected 1')
                data.emit('test event', req.body);
            });
            console.log("socket fired");
            res.send(req.body)
        } catch (e) {
            console.log(e.message)
        }
    });
}