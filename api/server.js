process.env.NODE_ENV = process.env.NODE_ENV || 'development';


var config = require('./config/config'),
    express = require('./config/express');


var app = express();
app.use(cors());
// module.exports = app;
// var server = require('http').createServer(app);
// var io = require('socket.io')(app.listen(config.port));
// io.on('connection', (data) => {
//     console.log('A socket is connected')
//     data.emit('test event', { name: "damodar", age: 27 });
// });
// require('../app/routes/sockets.server.routes')(app, io);


console.log(process.env.NODE_ENV + ' server running at http://localhost:' + config.port);