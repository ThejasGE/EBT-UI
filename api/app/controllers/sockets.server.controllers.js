let db = require('../../config/mongoose');

exports.socketsDashboard = (req, res, next) => {
    try {
        io.on('connection', (data) => {
            console.log('A socket is connected 1')
            data.emit('test event', req.body);
        });
        res.send(req.body);

    } catch (e) {
        console.log(e.message)
    }
}